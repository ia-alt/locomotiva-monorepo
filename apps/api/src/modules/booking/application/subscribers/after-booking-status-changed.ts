import { DomainEvents } from "@core/base-classes";
import { BookingConfirmedEvent } from "../../domain/events/booking-confirmed";
import { SendEmailService } from "@notifications/application/services";
import { UserRepository } from "src/modules/identity/domain/repositories";
import { RoomRepository } from "../../domain/repositories";
import { format } from "date-fns";
import { BookingEmailTemplater, CalendarService } from "../../domain/services";
import { BookingRejectedEvent } from "../../domain/events/booking-rejected";
import { BookingCancelledEvent } from "../../domain/events/booking-cancelled";
import { BookingCreatedEvent } from "../../domain/events/booking-created";
import { env } from "src/modules/env";


export class AfterBookingStatusChanged {
    constructor(
        private readonly sendEmailService: SendEmailService,
        private readonly userRepository: UserRepository,
        private readonly roomRepository: RoomRepository,
        private readonly bookingEmailTemplater: BookingEmailTemplater,
        private readonly adminUrl: string,
        private readonly calendarService: CalendarService,
    ) {
        this.setupSubscriptions();
    }

    private setupSubscriptions(): void {
        DomainEvents.register(this.onBookingConfirmed.bind(this), BookingConfirmedEvent.name);
        DomainEvents.register(this.onBookingRejected.bind(this), BookingRejectedEvent.name);
        DomainEvents.register(this.onBookingCancelled.bind(this), BookingCancelledEvent.name);
        DomainEvents.register(this.onBookingCreated.bind(this), BookingCreatedEvent.name);
    }

    private async onBookingConfirmed(event: BookingConfirmedEvent): Promise<void> {
        const { booking } = event;

        try {
            const [user, room] = await Promise.all([
                this.userRepository.findById(booking.userId),
                this.roomRepository.findById(booking.roomId),
            ]);

            if (!user || !room) return;

            const html = await this.bookingEmailTemplater.templateForConfirmedBooking({
                userName: user.firstName,
                roomName: room.name,
                day: format(booking.period.value.from, 'dd/MM/yyyy'),
                hourFrom: format(booking.period.value.from, 'HH:mm'),
                hourTo: format(booking.period.value.to, 'HH:mm'),
                title: booking.title,
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

        try {
            await this.calendarService.addEventOfBooking(booking);
            console.log(`[AfterBookingStatusChanged] Event added to calendar for booking ${booking.id.value}`);
        } catch (error) {
            console.error('[AfterBookingStatusChanged] Error adding event to calendar:', error);
        }
    }

    private async onBookingRejected(event: BookingRejectedEvent): Promise<void> {
        const { booking, reason } = event;

        try {
            const [user, room] = await Promise.all([
                this.userRepository.findById(booking.userId),
                this.roomRepository.findById(booking.roomId),
            ]);

            if (!user || !room) return;

            const html = await this.bookingEmailTemplater.templateForRejectedBooking({
                userName: user.firstName,
                roomName: room.name,
                day: format(booking.period.value.from, 'dd/MM/yyyy'),
                hourFrom: format(booking.period.value.from, 'HH:mm'),
                hourTo: format(booking.period.value.to, 'HH:mm'),
                title: booking.title,
            }, reason);

            await this.sendEmailService.send(
                user.email.value,
                'Reserva Rejeitada - Locomotiva Hub',
                html,
            );
            console.log(`[AfterBookingStatusChanged] Rejection email sent for booking ${booking.id.value}`);
        } catch (error) {
            console.error('[AfterBookingStatusChanged] Error sending rejection email:', error);
        }

        try {
            await this.calendarService.removeEventOfBookingIfExists(booking);
            console.log(`[AfterBookingStatusChanged] Event removed from calendar for booking ${booking.id.value}`);
        } catch (error) {
            console.error('[AfterBookingStatusChanged] Error removing event from calendar:', error);
        }
    }

    private async onBookingCancelled(event: BookingCancelledEvent): Promise<void> {
        const { booking } = event;

        try {
            const [user, room] = await Promise.all([
                this.userRepository.findById(booking.userId),
                this.roomRepository.findById(booking.roomId),
            ]);

            if (!user || !room) return;

            const html = await this.bookingEmailTemplater.templateForCancelledBooking({
                userName: user.firstName,
                roomName: room.name,
                day: format(booking.period.value.from, 'dd/MM/yyyy'),
                hourFrom: format(booking.period.value.from, 'HH:mm'),
                hourTo: format(booking.period.value.to, 'HH:mm'),
                title: booking.title,
            });

            await this.sendEmailService.send(
                user.email.value,
                'Reserva Cancelada - Locomotiva Hub',
                html,
            );
            console.log(`[AfterBookingStatusChanged] Cancellation email sent for booking ${booking.id.value}`);
        } catch (error) {
            console.error('[AfterBookingStatusChanged] Error sending cancellation email:', error);
        }

        try {
            await this.calendarService.removeEventOfBookingIfExists(booking);
            console.log(`[AfterBookingStatusChanged] Event removed from calendar for booking ${booking.id.value}`);
        } catch (error) {
            console.error('[AfterBookingStatusChanged] Error removing event from calendar:', error);
        }
    }

    private async onBookingCreated(event: BookingCreatedEvent): Promise<void> {
        try {
            const { booking } = event;
            const [user, room] = await Promise.all([
                this.userRepository.findById(booking.userId),
                this.roomRepository.findById(booking.roomId),
            ]);

            if (!user || !room) return;

            const emailParams = {
                userName: user.firstName,
                roomName: room.name,
                day: format(booking.period.value.from, 'dd/MM/yyyy'),
                hourFrom: format(booking.period.value.from, 'HH:mm'),
                hourTo: format(booking.period.value.to, 'HH:mm'),
                title: booking.title,
            };

            const bookingUrl = `${this.adminUrl}/reservations?view=${booking.id.value}`;

            const [userHtml, adminHtml] = await Promise.all([
                this.bookingEmailTemplater.templateForCreatedBooking(emailParams),
                this.bookingEmailTemplater.templateForAdminNewBooking(emailParams, bookingUrl),
            ]);

            await Promise.all([
                this.sendEmailService.send(
                    user.email.value,
                    'Novo Pedido de Reserva Criado - Locomotiva Hub',
                    userHtml,
                ),
                this.sendEmailService.send(
                    env.NODEMAILER_EMAIL_USER,
                    `Novo Pedido de Reserva - ${user.firstName} (${emailParams.day})`,
                    adminHtml,
                ),
            ]);
            console.log(`[AfterBookingStatusChanged] Creation email sent for booking ${booking.id.value}`);
        } catch (error) {
            console.error('[AfterBookingStatusChanged] Error sending creation email:', error);
        }
    }

}
