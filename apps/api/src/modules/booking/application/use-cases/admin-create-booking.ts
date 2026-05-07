import { Booking } from "@booking/domain/entities";
import { BookingService } from "@booking/domain/services";
import { UniqueId, UseCase } from "@core/base-classes";
import { DatePeriod } from "@core/value-objects";
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

        const userId = UniqueId.fromString(params.userId);
        const roomId = UniqueId.fromString(params.roomId);
        const period = DatePeriod.fromPrimitive(params.period);

        const booking = await this.bookingService.createBookingRequest({
            userId,
            roomId,
            title: params.title,
            period,
            description: params.description,
            numberOfPeople: params.numberOfPeople,
        });

        return booking.toJSON();
    }
}

namespace AdminCreateBookingUseCase {
    export const InputSchema = z.object({
        userId: z.string(),
        roomId: z.string(),
        title: z.string(),
        period: DatePeriod.ValueSchema,
        description: z.string().optional(),
        numberOfPeople: z.number().int().positive().optional(),
    });

    export const OutputSchema = Booking.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { AdminCreateBookingUseCase };
