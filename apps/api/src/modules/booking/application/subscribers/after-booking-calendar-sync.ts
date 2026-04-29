import { DomainEvents } from "@core/base-classes";
import { BookingConfirmedEvent } from "../../domain/events/booking-confirmed";
import { BookingRejectedEvent } from "../../domain/events/booking-rejected";
import { BookingCancelledEvent } from "../../domain/events/booking-cancelled";
import { CalendarService } from "../../domain/services";

export class AfterBookingCalendarSync {
    constructor(
        private readonly calendarService: CalendarService,
    ) {
        this.setupSubscriptions();
    }

    private setupSubscriptions(): void {
        DomainEvents.register(this.onBookingConfirmed.bind(this), BookingConfirmedEvent.name);
        DomainEvents.register(this.onBookingRejected.bind(this), BookingRejectedEvent.name);
        DomainEvents.register(this.onBookingCancelled.bind(this), BookingCancelledEvent.name);
    }

    private async onBookingConfirmed(event: BookingConfirmedEvent): Promise<void> {
        try {
            await this.calendarService.addEventOfBooking(event.booking);
            console.log(`[AfterBookingCalendarSync] Event added to calendar for booking ${event.booking.id.value}`);
        } catch (error) {
            console.error('[AfterBookingCalendarSync] Error adding event to calendar:', error);
        }
    }

    private async onBookingRejected(event: BookingRejectedEvent): Promise<void> {
        try {
            await this.calendarService.removeEventOfBookingIfExists(event.booking);
            console.log(`[AfterBookingCalendarSync] Event removed from calendar for booking ${event.booking.id.value}`);
        } catch (error) {
            console.error('[AfterBookingCalendarSync] Error removing event from calendar:', error);
        }
    }

    private async onBookingCancelled(event: BookingCancelledEvent): Promise<void> {
        try {
            await this.calendarService.removeEventOfBookingIfExists(event.booking);
            console.log(`[AfterBookingCalendarSync] Event removed from calendar for booking ${event.booking.id.value}`);
        } catch (error) {
            console.error('[AfterBookingCalendarSync] Error removing event from calendar:', error);
        }
    }
}
