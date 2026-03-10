import { BookingRepository } from "@booking/domain/repositories";
import { UniqueId, UseCase } from "@core/base-classes";
import z from "zod";
import { AuthUserService } from "src/modules/identity/domain/services";
import { BookingNotFoundError } from "../errors";

class ProcessBookingRequestUseCase extends UseCase<ProcessBookingRequestUseCase.Input, ProcessBookingRequestUseCase.Output> {

    constructor(
        private readonly authUserService: AuthUserService,
        private readonly bookingRepository: BookingRepository,
    ) {
        super();
    }

    async execute(params: ProcessBookingRequestUseCase.Input): Promise<ProcessBookingRequestUseCase.Output> {
        this.authUserService.checkIsAdmin();
        const bookingId = UniqueId.fromString(params.bookingId);

        const booking = await this.bookingRepository.findById(bookingId);
        if (!booking) {
            throw new BookingNotFoundError(bookingId);
        }

        if (params.decision.type === 'confirm') {
            booking.confirm();
        } else {
            booking.reject(params.decision.reason);
        }

        await this.bookingRepository.save(booking);
    }
}

namespace ProcessBookingRequestUseCase {
    export const InputSchema = z.object({
        bookingId: z.string(),
        decision: z.union([
            z.object({
                type: z.literal('confirm'),
            }),
            z.object({
                type: z.literal('reject'),
                reason: z.string(),
            })
        ])
    });

    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { ProcessBookingRequestUseCase };