import { Booking } from "@booking/domain/entities";
import { BookingRepository, RoomRepository } from "@booking/domain/repositories";
import { UniqueId, UseCase } from "@core/base-classes";
import z from "zod";
import { AuthUserService } from "src/modules/identity/domain/services";
import { UserRepository } from "src/modules/identity/domain/repositories";
import { SendEmailService } from "@notifications/application/services";
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
            await this.sendConfirmationEmail(booking).catch((err) => {
                console.error('[ProcessBookingRequest] Falha ao enviar email de confirmação:', err);
            });
        } else {
            booking.reject(params.decision.reason);
            await this.bookingRepository.save(booking);
        }
    }

    private async sendConfirmationEmail(booking: Booking): Promise<void> {
        const [user, room] = await Promise.all([
            this.userRepository.findById(booking.userId),
            this.roomRepository.findById(booking.roomId),
        ]);

        if (!user) return;

        const day = format(booking.period.value.from, 'dd/MM/yyyy');
        const hourFrom = format(booking.period.value.from, 'HH:mm');
        const hourTo = format(booking.period.value.to, 'HH:mm');
        const roomName = room?.name ?? 'sala reservada';

        const htl = `
            <h1>Reserva Confirmada!</h1>
            <p>Olá ${user.firstName},</p>
            <p>Sua reserva foi <strong>confirmada</strong>.</p>
            <ul>
                <li><strong>Sala:</strong> ${roomName}</li>
                <li><strong>Data:</strong> ${day}</li>
                <li><strong>Horário:</strong> ${hourFrom} às ${hourTo}</li>
                <li><strong>Título:</strong> ${booking.title}</li>
            </ul>
            <p>Atenciosamente,</p>
            <p>Equipe Locomotiva</p>
        `;

        await this.sendEmailService.send(
            user.email.value,
            'Reserva Confirmada - Locomotiva Hub',
            html,
        );
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
