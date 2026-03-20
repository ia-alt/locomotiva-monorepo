import { Entity, UniqueId } from "@core/base-classes";
import { DatePeriod } from "@core/value-objects";
import z from "zod";
import { BookingLeadTimeViolationError, ForbiddenBookingAccessException, BookingNotInPendingStateError, BookingCannotBeCancelledError } from "../errors";

export class Booking extends Entity {
    constructor(
        id: UniqueId,
        public readonly roomId: UniqueId,
        public readonly userId: UniqueId,
        private _period: DatePeriod,
        private status: Booking.Status,
        private rejectionCancelReason?: string,
        private description?: string,
    ) {
        super(id);
    }

    get period(): DatePeriod {
        return this._period;
    }

    static create(input: Booking.CreateParams): Booking {
        return new Booking(
            UniqueId.create(),
            input.roomId,
            input.userId,
            input.period,
            Booking.Status.PENDING,
            undefined,
            input.description,
        );
    }

    confirm(): void {
        if (this.status !== Booking.Status.PENDING) {
            throw new BookingNotInPendingStateError();
        }
        this.status = Booking.Status.CONFIRMED;
    }

    cancel(executorId: UniqueId, reason: string): void {
        // 1. Validação de Propriedade
        if (!this.userId.equals(executorId)) {
            throw new ForbiddenBookingAccessException(this.id);
        }

        // 2. Validação de Antecedência (Lead Time)
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
    }

    adminCancel(reason: string): void {
        this.status = Booking.Status.CANCELLED;
        this.rejectionCancelReason = reason;
    }

    reject(reason?: string): void {
        const rejectableStatuses = [Booking.Status.PENDING, Booking.Status.CONFIRMED];
        if (!rejectableStatuses.includes(this.status)) {
            throw new BookingNotInPendingStateError();
        }
        this.status = Booking.Status.REJECTED;
        this.rejectionCancelReason = reason;
    }

    markNoShow(): void {
        this.status = Booking.Status.NO_SHOW;
    }

    toJSON(): Booking.JsonSchema {
        return {
            id: this.id.value,
            roomId: this.roomId.value,
            userId: this.userId.value,
            period: this._period.toJSON(),
            status: this.status,
            description: this.description,
            rejectionCancelReason: this.rejectionCancelReason,
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
        period: DatePeriod.ValueSchema,
        status: z.enum(Status),
        description: z.string().optional(),
        rejectionCancelReason: z.string().optional(),
    });

    export type CreateParams = {
        roomId: UniqueId;
        userId: UniqueId;
        period: DatePeriod;
        description?: string;
    };
    export type JsonSchema = z.infer<typeof JsonSchema>;
}