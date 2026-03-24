import { Booking } from "@booking/domain/entities";
import { BookingRepository } from "@booking/domain/repositories";
import { UniqueId, UseCase } from "@core/base-classes";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { BookingNotFoundError } from "../errors";

class MarkBookingNoShowUseCase extends UseCase<MarkBookingNoShowUseCase.Input, MarkBookingNoShowUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly bookingRepository: BookingRepository,
    ) {
        super();
    }

    async execute(params: MarkBookingNoShowUseCase.Input): Promise<MarkBookingNoShowUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const bookingId = UniqueId.fromString(params.bookingId);
        const booking = await this.bookingRepository.findById(bookingId);
        if (!booking) {
            throw new BookingNotFoundError(bookingId);
        }

        booking.markNoShow();
        await this.bookingRepository.save(booking);
    }

}

namespace MarkBookingNoShowUseCase {
    export const InputSchema = z.object({ bookingId: z.string() });
    export const OutputSchema = z.void();
    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { MarkBookingNoShowUseCase };
