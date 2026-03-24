import { Booking } from "@booking/domain/entities";
import { BookingRepository, RoomRepository } from "@booking/domain/repositories";
import { UniqueId, UseCase } from "@core/base-classes";
import z from "zod";
import { AuthUserService } from "src/modules/identity/domain/services";
import { UserRepository } from "src/modules/identity/domain/repositories";
import { SendEmailService } from "@notifications/application/services";
import { buildBookingEmail } from "@notifications/infra/templates/booking-email";
import { BookingNotFoundError } from "../errors";
import { format } from "date-fns";

class ProcessBookingRequestUseCase extends UseCase<ProcessBookingRequestUseCase.Input, ProcessBookingRequestUseCase.Output> {

    constructor(
        private readonly authUserService: AuthUserService,
        private readonly bookingRepository: BookingRepository,
        private readonly userRepository: UserRepository,
        private readonly roomRepository: RoomRepository,
        private readonly sendEmailService: SendEmailService,
    ) {
        super();
    }

    async execute(params: ProcessBookingRequestUseCase.Input): Promise<ProcessBookingRequestUseCase.Output> {
        this.authUserService.checkIsAdmin();
        const bookingId = UniqueId.fromString(params.bookingId);

        const booking = await this.bookingRepository.findById(bookingId);
        if (!booking) {
            throw new BookingNotFoundError(bookingId);
        }

        if (params.decision.type === 'confirm') {
            booking.confirm();
            await this.bookingRepository.save(booking);
            await this.sendBookingEmail(booking, 'confirmed').catch((err) => {
                console.error('[ProcessBookingRequest] Falha ao enviar email de confirmação:', err);
            });
        } else {
            const wasConfirmed = booking.currentStatus === Booking.Status.CONFIRMED;
            booking.reject(params.decision.reason);
            await this.bookingRepository.save(booking);
            const emailStatus = wasConfirmed ? 'cancelled' : 'rejected';
            await this.sendBookingEmail(booking, emailStatus, params.decision.reason).catch((err) => {
                console.error('[ProcessBookingRequest] Falha ao enviar email de rejeição/cancelamento:', err);
            });
        }
    }

    private async sendBookingEmail(booking: Booking, status: 'confirmed' | 'rejected' | 'cancelled', reason?: string): Promise<void> {
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
            status,
            reason,
        });

        const subject = status === 'confirmed'
            ? 'Reserva Confirmada - Locomotiva Hub'
            : 'Reserva Recusada - Locomotiva Hub';

        await this.sendEmailService.send(user.email.value, subject, html);
    }
}

namespace ProcessBookingRequestUseCase {
    export const InputSchema = z.object({
        bookingId: z.string(),
        decision: z.union([
            z.object({
                type: z.literal('confirm'),
            }),
            z.object({
                type: z.literal('reject'),
                reason: z.string().optional(),
            })
        ])
    });

    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { ProcessBookingRequestUseCase };
