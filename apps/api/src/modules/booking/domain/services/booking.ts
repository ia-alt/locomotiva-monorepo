import { BookingRepository, RoomRepository } from "@booking/domain/repositories";
import { DatePeriod, OnlyDate, OnlyTime } from "@core/value-objects";
import { UniqueId } from "@core/base-classes";
import { SpaceOperatingHoursService } from "@operating-hours/domain/services";
import { Booking } from "../entities";
import { RoomUnavailableError, BookingInPastError, RoomCapacityExceededError, IncompleteUserProfileError } from "../errors";
import { User } from "src/modules/identity/domain/entities";
import { UserRepository } from "src/modules/identity/domain/repositories";
import { BookingWithUser } from "../value-objects/booking-with-user";
import { TimeInterval } from "src/modules/operating-hours/domain/value-objects";

class BookingService {
    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly spaceOperatingHoursService: SpaceOperatingHoursService,
        private readonly roomRepository: RoomRepository,
        private readonly userRepository: UserRepository,
    ) { }

    async createBookingRequest(params: Booking.CreateParams, user: User): Promise<Booking> {
        if (params.period.value.from <= new Date()) {
            throw new BookingInPastError();
        }

        //TODO: mudar depois
        const day = OnlyDate.fromDate(params.period.value.from);
        const timeInterval = new TimeInterval({
            start: OnlyTime.fromDate(params.period.value.from),
            end: OnlyTime.fromDate(params.period.value.to),
        });

        await this.checkAvailability(params.roomId, day, timeInterval);

        if (!user.isAdmin()) {
            if (user.company === null || user.jobTitle === null) {
                throw new IncompleteUserProfileError();
            }

            const room = await this.roomRepository.findById(params.roomId);
            if (room && params.numberOfPeople > room.toJSON().capacity) {
                throw new RoomCapacityExceededError(params.numberOfPeople, room.toJSON().capacity);
            }
        }

        const booking = Booking.create(params);
        await this.bookingRepository.save(booking);
        return booking;
    }


    async checkAvailability(roomId: UniqueId, day: OnlyDate, timeInterval: TimeInterval): Promise<void> {
        const dailyAvailability = await this.spaceOperatingHoursService.getAvailabilityForDay(roomId, day);

        if (!dailyAvailability) {
            throw new RoomUnavailableError(`O espaço não possui horário de funcionamento para o dia ${day.value}`);
        }

        if (!dailyAvailability.contains(timeInterval)) {
            throw new RoomUnavailableError(`O horário solicitado (${timeInterval}) está fora do horário de funcionamento do espaço (${dailyAvailability})`);
        }

        const bookings = await this.bookingRepository.findByDay({
            day,
            roomId,
            status: Booking.ActiveStatus,
        });

        const usedSlots = bookings.map(x => x.timeInterval);

        const overlapsSome = usedSlots.some(x => x.overlaps(timeInterval));

        if (overlapsSome) {
            throw new RoomUnavailableError(`O horário solicitado (${timeInterval}) está ocupado`);
        }
    }

    async findAllByMonthWithUsers(year: number, month: number): Promise<BookingWithUser[]> {
        const allBookings = await this.bookingRepository.findAllByMonth(year, month);

        const reportStatuses = [Booking.Status.CONFIRMED, Booking.Status.ATTENDED, Booking.Status.NO_SHOW];
        const bookings = allBookings.filter(b => reportStatuses.includes(b.currentStatus));

        if (bookings.length === 0) return [];

        const userIds = bookings.map(b => UniqueId.fromString(b.userId.value));
        const roomIds = bookings.map(b => UniqueId.fromString(b.roomId.value));

        const [users, rooms] = await Promise.all([
            this.userRepository.findManyByIds(userIds),
            this.roomRepository.findManyByIds(roomIds),
        ]);

        const userMap = new Map(users.map(u => [u.id.value, u]));
        const roomMap = new Map(rooms.map(r => [r.id.value, r]));

        const items: BookingWithUser[] = [];
        for (const booking of bookings) {
            const user = userMap.get(booking.userId.value);
            const room = roomMap.get(booking.roomId.value);
            if (!user || !room) continue;
            items.push(new BookingWithUser({ booking, user, room }));
        }
        return items;
    }

    async getAvailableSlotsByRoom(roomId: UniqueId, day: OnlyDate): Promise<DatePeriod[]> {
        const dailyAvailability = await this.spaceOperatingHoursService.getAvailabilityForDay(roomId, day);
        if (!dailyAvailability) {
            return [];
        }
        const roomOperatingHours = dailyAvailability.toDatePeriod(day);

        const bookings = await this.bookingRepository.findByDay({
            day,
            roomId,
            status: Booking.ActiveStatus,
        });
        const freeSlots = roomOperatingHours.flatMap(x => x.subtractAll(bookings.map(x => x.period)));
        return freeSlots;
    }
}

export { BookingService }