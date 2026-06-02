import { Booking } from "@booking/domain/entities";
import { BookingService } from "@booking/domain/services";
import { UniqueId, UseCase } from "@core/base-classes";
import { DatePeriod, OnlyDate } from "@core/value-objects";
import { TimeInterval } from "@operating-hours/domain/value-objects";
import { dayAndIntervalToPeriod } from "../helpers/day-interval-to-period";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

class AdminCreateBookingUseCase extends UseCase<AdminCreateBookingUseCase.Input, AdminCreateBookingUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly bookingService: BookingService,
    ) {
        super();
    }

    async execute(params: AdminCreateBookingUseCase.Input): Promise<AdminCreateBookingUseCase.Output> {
        this.authUserService.checkIsAdmin();
        const adminUser = this.authUserService.getUser();

        const userId = UniqueId.fromString(params.userId);
        const roomId = UniqueId.fromString(params.roomId);
        const period = params.day && params.timeInterval
            ? dayAndIntervalToPeriod(
                OnlyDate.fromJSON(params.day),
                TimeInterval.fromJSON(params.timeInterval),
            )
            : DatePeriod.fromPrimitive(params.period!);

        const booking = await this.bookingService.createBookingRequest({
            userId,
            roomId,
            title: params.title,
            period,
            description: params.description,
            numberOfPeople: params.numberOfPeople,
        }, adminUser);

        return booking.toJSON();
    }
}

namespace AdminCreateBookingUseCase {
    export const InputSchema = z.object({
        userId: z.string(),
        roomId: z.string(),
        title: z.string(),
        // TODO: remover period depois que mobile/tablet migrarem para day + timeInterval
        period: DatePeriod.ValueSchema.optional(),
        day: OnlyDate.JsonSchema.optional(),
        timeInterval: TimeInterval.JsonSchema.optional(),
        description: z.string().optional(),
        numberOfPeople: z.number(),
    }).refine(
        (v) => (v.day && v.timeInterval) || v.period,
        { message: "Informe day + timeInterval ou period" },
    );

    export const OutputSchema = Booking.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { AdminCreateBookingUseCase };
