import { BookingRepository, RoomRepository } from "@booking/domain/repositories";
import { DatePeriod, OnlyDate } from "@core/value-objects";
import { UniqueId } from "@core/base-classes";
import { SpaceOperatingHoursService } from "@operating-hours/domain/services";
import { Booking } from "../entities";
import { RoomUnavailableError, BookingInPastError, RoomCapacityExceededError } from "../errors";

class BookingService {
    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly spaceOperatingHoursService: SpaceOperatingHoursService,
        private readonly roomRepository: RoomRepository,
    ) { }

    async createBookingRequest(params: Booking.CreateParams, isAdmin: boolean): Promise<Booking> {
        if (params.period.value.from <= new Date()) {
            throw new BookingInPastError();
        }

        const isAvailable = await this.checkAvailability(params.roomId, params.period);

        if (!isAvailable) {
            throw new RoomUnavailableError();
        }

        if (!isAdmin) {
            const room = await this.roomRepository.findById(params.roomId);
            if (room && params.numberOfPeople !== null && params.numberOfPeople > room.toJSON().capacity) {
                throw new RoomCapacityExceededError(params.numberOfPeople, room.toJSON().capacity);
            }
        }

        const booking = Booking.create(params);
        await this.bookingRepository.save(booking);
        return booking;
    }


    async checkAvailability(roomId: UniqueId, period: DatePeriod): Promise<boolean> {
        const day = OnlyDate.fromDate(period.value.from);
        const bookings = await this.bookingRepository.findByDay({
            day,
            roomId,
            status: Booking.ActiveStatus,
        });
        const usedSlots = bookings.map(x => x.period);
        const overlapsSome = usedSlots.some(x => x.overlaps(period));
        return !overlapsSome;
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