import { Booking } from "@booking/domain/entities";
import { BookingRepository } from "@booking/domain/repositories";
import { UseCase, UniqueId } from "@core/base-classes";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { BookingNotFoundError } from "../errors";

class GetBookingByIdUseCase extends UseCase<GetBookingByIdUseCase.Input, GetBookingByIdUseCase.Result> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly bookingRepository: BookingRepository,
    ) {
        super();
    }

    async execute(params: GetBookingByIdUseCase.Input): Promise<GetBookingByIdUseCase.Result> {
        const user = this.authUserService.getUser();
        const bookingId = UniqueId.fromString(params.id);

        const booking = await this.bookingRepository.findById(bookingId);

        if (!booking) {
            throw new BookingNotFoundError(bookingId);
        }

        if (!user.isAdmin()) {
            booking.checkOwner(user.id);
        }

        return booking.toJSON();
    }
}

namespace GetBookingByIdUseCase {
    export const InputSchema = z.object({
        id: z.string(),
    });

    export const OutputSchema = Booking.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Result = z.infer<typeof OutputSchema>;
}

export { GetBookingByIdUseCase };
