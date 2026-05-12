import { AggregateRoot, UniqueId } from "@core/base-classes";
import { DatePeriod } from "@core/value-objects";
import { BookingCreatedEvent } from "../events/booking-created";
import { BookingConfirmedEvent } from "../events/booking-confirmed";
import { BookingRejectedEvent } from "../events/booking-rejected";
import { BookingCancelledEvent } from "../events/booking-cancelled";
import z from "zod";
import { BookingLeadTimeViolationError, ForbiddenBookingAccessException, BookingNotInPendingStateError, BookingCannotBeCancelledError } from "../errors";
import { BookingTitle, BookingDescription, BookingNumberOfPeople } from "@core/value-objects";

export class Booking extends AggregateRoot {
    constructor(
        id: UniqueId,
        public readonly roomId: UniqueId,
        public readonly userId: UniqueId,
        public readonly title: string,
        public readonly description: string,
        private _period: DatePeriod,
        private status: Booking.Status,
        private rejectionCancelReason: string | undefined,
        private createdAt: Date,
        private updatedAt: Date,
        private _numberOfPeople: number | null,
    ) {
        super(id);
        new BookingTitle(title);
        new BookingDescription(description);
        if (_numberOfPeople !== null) new BookingNumberOfPeople(_numberOfPeople);
    }

    get period(): DatePeriod {
        return this._period;
    }

    get currentStatus(): Booking.Status {
        return this.status;
    }

    get numberOfPeople(): number | null {
        return this._numberOfPeople;
    }

    updateNumberOfPeople(value: number): void {
        this._numberOfPeople = value;
        this.updatedAt = new Date();
    }

    static create(input: Booking.CreateParams): Booking {
        const booking = new Booking(
            UniqueId.create(),
            input.roomId,
            input.userId,
            input.title,
            input.description ?? '',
            input.period,
            Booking.Status.PENDING,
            undefined,
            new Date(),
            new Date(),
            input.numberOfPeople,
        );
        booking.addDomainEvent(new BookingCreatedEvent(booking));
        return booking;
    }

    confirm(): void {
        if (this.status !== Booking.Status.PENDING) {
            throw new BookingNotInPendingStateError();
        }
        this.status = Booking.Status.CONFIRMED;
        this.updatedAt = new Date();
        this.addDomainEvent(new BookingConfirmedEvent(this));
    }

    cancel(executorId: UniqueId, reason: string): void {
        this.checkOwner(executorId);

        const LEAD_TIME_HOURS = 48;
        const limitDate = new Date((new Date()).getTime() + LEAD_TIME_HOURS * 60 * 60 * 1000);

        if (this.period.value.from < limitDate) {
            throw new BookingLeadTimeViolationError(LEAD_TIME_HOURS);
        }

        const notCancelableStatus = [
            Booking.Status.CANCELLED,
            Booking.Status.ATTENDED,
            Booking.Status.NO_SHOW,
        ];

        if (notCancelableStatus.includes(this.status)) {
            throw new BookingCannotBeCancelledError();
        }

        this.status = Booking.Status.CANCELLED;
        this.rejectionCancelReason = reason;
        this.updatedAt = new Date();
        this.addDomainEvent(new BookingCancelledEvent(this, reason));
    }

    checkOwner(userId: UniqueId): void {
        if (!this.userId.equals(userId)) {
            throw new ForbiddenBookingAccessException(this.id);
        }
    }

    adminCancel(reason: string): void {
        this.status = Booking.Status.CANCELLED;
        this.rejectionCancelReason = reason;
        this.updatedAt = new Date();
        this.addDomainEvent(new BookingCancelledEvent(this, reason));
    }

    reject(reason: string): void {
        const rejectableStatuses = [Booking.Status.PENDING, Booking.Status.CONFIRMED];
        if (!rejectableStatuses.includes(this.status)) {
            throw new BookingNotInPendingStateError();
        }
        this.status = Booking.Status.REJECTED;
        this.rejectionCancelReason = reason;
        this.updatedAt = new Date();
        this.addDomainEvent(new BookingRejectedEvent(this, reason));
    }

    markNoShow(): void {
        this.status = Booking.Status.NO_SHOW;
        this.updatedAt = new Date();
    }

    toJSON(): Booking.JsonSchema {
        return {
            id: this.id.value,
            roomId: this.roomId.value,
            userId: this.userId.value,
            title: this.title,
            description: this.description,
            period: this._period.toJSON(),
            status: this.status,
            rejectionCancelReason: this.rejectionCancelReason,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            numberOfPeople: this._numberOfPeople,
        };
    }
}

export namespace Booking {
    export enum Status {
        PENDING = 'pending',
        CANCELLED = 'cancelled',
        REJECTED = 'rejected',
        CONFIRMED = 'confirmed',
        ATTENDED = 'attended',
        NO_SHOW = 'no_show',
    }

    export const StatusSchema = z.enum(Status);

    export const NotActiveStatus = [
        Booking.Status.CANCELLED,
        Booking.Status.REJECTED,
    ];

    export const ActiveStatus = [
        Booking.Status.PENDING,
        Booking.Status.CONFIRMED,
        Booking.Status.ATTENDED,
        Booking.Status.NO_SHOW,
    ];

    export const JsonSchema = z.object({
        id: z.string(),
        roomId: z.string(),
        userId: z.string(),
        title: z.string(),
        description: z.string(),
        period: DatePeriod.ValueSchema,
        status: z.enum(Status),
        rejectionCancelReason: z.string().optional(),
        createdAt: z.string(),
        updatedAt: z.string(),
        numberOfPeople: z.number().nullable(),
    });

    export type CreateParams = {
        roomId: UniqueId;
        userId: UniqueId;
        title: string;
        description?: string;
        period: DatePeriod;
        numberOfPeople: number;
    };
    export type JsonSchema = z.infer<typeof JsonSchema>;
}