import { DomainEvents } from "@core/base-classes";
import { BookingConfirmedEvent } from "../../domain/events/booking-confirmed";
import { SendEmailService } from "@notifications/application/services";
import { UserRepository } from "src/modules/identity/domain/repositories";
import { RoomRepository } from "../../domain/repositories";
import { format } from "date-fns";
import { buildBookingEmail } from "@notifications/infra/templates/booking-email";

export class AfterBookingStatusChanged {
    constructor(
        private readonly sendEmailService: SendEmailService,
        private readonly userRepository: UserRepository,
        private readonly roomRepository: RoomRepository,
    ) {
        this.setupSubscriptions();
    }

    private setupSubscriptions(): void {
        DomainEvents.register(this.onBookingConfirmed.bind(this), BookingConfirmedEvent.name);
    }

    private async onBookingConfirmed(event: BookingConfirmedEvent): Promise<void> {
        try {
            const { booking } = event;
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
                status: 'confirmed',
            });

            await this.sendEmailService.send(
                user.email.value,
                'Reserva Confirmada - Locomotiva Hub',
                html,
            );
            console.log(`[AfterBookingStatusChanged] Confirmation email sent for booking ${booking.id.value}`);
        } catch (error) {
            console.error('[AfterBookingStatusChanged] Error sending confirmation email:', error);
        }
    }
}
