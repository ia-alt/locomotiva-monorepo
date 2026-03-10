import { UseCase } from "@core/base-classes";
import z from "zod";
import { AuthUserService } from "src/modules/identity/domain/services";
import { BookingRepository, RoomRepository } from "@booking/domain/repositories";
import { OnlyDate } from "@core/value-objects";
import { Booking, Room } from "@booking/domain/entities";
import { BookingReminderEmailTemplater } from "@booking/application/services";
import { UserRepository } from "src/modules/identity/domain/repositories";
import { User } from "src/modules/identity/domain/entities";
import { SendEmailService } from "@notifications/application/services";

class SendBookingRemindersOfTomorrowUseCase extends UseCase<SendBookingRemindersOfTomorrowUseCase.Input, SendBookingRemindersOfTomorrowUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly bookingRepository: BookingRepository,
        private readonly userRepository: UserRepository,
        private readonly bookingReminderEmailTemplater: BookingReminderEmailTemplater,
        private readonly sendEmailService: SendEmailService,
        private readonly roomRepository: RoomRepository,
    ) {
        super();
    }

    async execute(): Promise<SendBookingRemindersOfTomorrowUseCase.Output> {
        await this.authUserService.checkIsSystem();
        const bookingsWithUsers = await this.getBookingsOfTomorrowWithUsersAndRoom();
        const emailsToSend = await Promise.all(bookingsWithUsers.map(async x => {
            const html = await this.bookingReminderEmailTemplater.template({
                booking: x.booking,
                user: x.user,
                room: x.room,
            });
            return {
                to: x.user.email.toString(),
                subject: `Lembrete de reserva - ${x.room.name}`,
                html,
            };
        }));
        for (const emailToSend of emailsToSend) {
            await this.sendEmailService.send(
                emailToSend.to,
                emailToSend.subject,
                emailToSend.html
            );
        }
    }

    private async getBookingsOfTomorrowWithUsersAndRoom(): Promise<{ booking: Booking, user: User, room: Room }[]> {
        const bookings = await this.getBookingsOfTomorrow();
        const usersIds = bookings.map(x => x.userId);
        const roomsIds = bookings.map(x => x.roomId);

        const users = await this.userRepository.findManyByIds(usersIds);
        const rooms = await this.roomRepository.findManyByIds(roomsIds);

        return bookings.map(x => {
            const user = users.find(y => y.id === x.userId);
            const room = rooms.find(y => y.id === x.roomId);

            if (!user) {
                throw new Error(`User ${x.userId} not found`);
            }

            if (!room) {
                throw new Error(`Room ${x.roomId} not found`);
            }

            return {
                booking: x,
                user,
                room,
            };
        });
    }

    private async getBookingsOfTomorrow(): Promise<Booking[]> {
        const tomorrowDate = new Date();
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        const tomorrow = OnlyDate.fromDate(tomorrowDate);

        const bookings = await this.bookingRepository.findByDay({
            day: tomorrow,
            status: Booking.ActiveStatus,
        });
        return bookings;
    }
}

namespace SendBookingRemindersOfTomorrowUseCase {
    export const InputSchema = z.void();

    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { SendBookingRemindersOfTomorrowUseCase };
