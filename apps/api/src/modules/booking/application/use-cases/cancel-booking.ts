import { UniqueId, UseCase } from "@core/base-classes";
import { BookingRepository } from "@booking/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { BookingNotFoundError } from "../errors";

class CancelBookingUseCase extends UseCase<CancelBookingUseCase.Input, CancelBookingUseCase.Output> {

    constructor(
        private readonly authUserService: AuthUserService,
        private readonly bookingRepository: BookingRepository,
    ) {
        super();
    }

    async execute(params: CancelBookingUseCase.Input): Promise<CancelBookingUseCase.Output> {
        const user = this.authUserService.getUser();
        const bookingId = UniqueId.fromString(params.bookingId);

        const booking = await this.bookingRepository.findById(bookingId);
        if (!booking) {
            throw new BookingNotFoundError(bookingId);
        }

        booking.cancel(user.id, params.reason);

        await this.bookingRepository.save(booking);
        return;
    }
}

namespace CancelBookingUseCase {
    export const InputSchema = z.object({
        bookingId: z.string(),
        reason: z.string(),
    });

    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { CancelBookingUseCase };