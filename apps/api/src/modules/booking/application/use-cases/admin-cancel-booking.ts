import { Booking } from "@booking/domain/entities";
import { UniqueId, UseCase } from "@core/base-classes";
import { BookingRepository, RoomRepository } from "@booking/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import { UserRepository } from "src/modules/identity/domain/repositories";
import { SendEmailService } from "@notifications/application/services";
import { buildBookingEmail } from "@notifications/infra/templates/booking-email";
import z from "zod";
import { BookingNotFoundError } from "../errors";
import { format } from "date-fns";


class AdminCancelBookingUseCase extends UseCase<AdminCancelBookingUseCase.Input, AdminCancelBookingUseCase.Output> {

    constructor(
        private readonly authUserService: AuthUserService,
        private readonly bookingRepository: BookingRepository,
        private readonly userRepository: UserRepository,
        private readonly roomRepository: RoomRepository,
        private readonly sendEmailService: SendEmailService,
    ) {
        super();
    }

    async execute(params: AdminCancelBookingUseCase.Input): Promise<AdminCancelBookingUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const bookingId = UniqueId.fromString(params.bookingId);

        const booking = await this.bookingRepository.findById(bookingId);
        if (!booking) {
            throw new BookingNotFoundError(bookingId);
        }

        booking.adminCancel(params.reason);
        await this.bookingRepository.save(booking);

        await this.sendCancellationEmail(booking, params.reason).catch((err) => {
            console.error('[AdminCancelBooking] Falha ao enviar email de cancelamento:', err);
        });
    }

    private async sendCancellationEmail(booking: Booking, reason: string): Promise<void> {
        const [user, room] = await Promise.all([
            this.userRepository.findById(booking.userId),
            this.roomRepository.findById(booking.roomId),
        ]);

        if (!user) return;

        const html = buildBookingEmail({
            userName: user.firstName,
            roomName: room?.name ?? 'sala reservada',
            day: format(booking.period.value.from, 'dd/MM/yyyy'),
            hourFrom: format(booking.period.value.from, 'HH:mm'),
            hourTo: format(booking.period.value.to, 'HH:mm'),
            title: booking.title,
            status: 'cancelled',
            reason,
        });

        await this.sendEmailService.send(
            user.email.value,
            'Reserva Cancelada - Locomotiva Hub',
            html,
        );
    }
}

namespace AdminCancelBookingUseCase {
    export const InputSchema = z.object({
        bookingId: z.string(),
        reason: z.string(),
    });

    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { AdminCancelBookingUseCase };
