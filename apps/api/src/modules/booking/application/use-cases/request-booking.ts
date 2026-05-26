import { Booking } from "@booking/domain/entities";
import { BookingService } from "@booking/domain/services";
import { UniqueId, UseCase } from "@core/base-classes";
import { DatePeriod } from "@core/value-objects";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

class RequestBookingUseCase extends UseCase<RequestBookingUseCase.Input, RequestBookingUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly bookingService: BookingService,
    ) {
        super();
    }

    async execute(params: RequestBookingUseCase.Input): Promise<RequestBookingUseCase.Output> {
        const user = this.authUserService.getUser();
        const roomId = UniqueId.fromString(params.roomId);
        const period = DatePeriod.fromPrimitive(params.period);
        const { title, description, numberOfPeople } = params;

        const booking = await this.bookingService.createBookingRequest({
            userId: user.id,
            roomId,
            title,
            description,
            period,
            numberOfPeople
        }, user);

        return booking.toJSON();
    }
}
namespace RequestBookingUseCase {
    export const InputSchema = z.object({
        roomId: z.string(),
        title: z.string(),
        description: z.string().optional(),
        period: DatePeriod.ValueSchema,
        numberOfPeople: z.number(),
    });

    export const OutputSchema = Booking.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { RequestBookingUseCase };