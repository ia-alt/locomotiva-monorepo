import { UseCase } from "@core/base-classes";
import { BookingRepository } from "@booking/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import { PaginatedQuery, PaginatedResult } from "@core/value-objects";
import z from "zod";

class FindBookingsAdminUseCase implements UseCase<FindBookingsAdminUseCase.Input, FindBookingsAdminUseCase.Output> {
    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly authUserService: AuthUserService,
    ) { }

    async execute(params: FindBookingsAdminUseCase.Input): Promise<FindBookingsAdminUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const result = await this.bookingRepository.findAllAdmin({
            pagination: PaginatedQuery.create(params.pagination),
            filter: params.filter,
        });

        return result.toJSON();
    }
}

namespace FindBookingsAdminUseCase {
    const FilterSchema = z.object({
        status: z.array(z.string()).optional(),
        roomId: z.string().optional(),
        search: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
    });

    export const InputSchema = z.object({
        pagination: PaginatedQuery.Schema,
        filter: FilterSchema.optional(),
    });

    export const OutputSchema = PaginatedResult.JsonSchema(BookingRepository.AdminBookingItemSchema);

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { FindBookingsAdminUseCase };
