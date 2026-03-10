import { Booking } from "@booking/domain/entities";
import { BookingRepository } from "@booking/domain/repositories";
import { UseCase } from "@core/base-classes";
import { DatePeriod, PaginatedQuery, PaginatedResult } from "@core/value-objects";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

class FindMyBookingsUseCase extends UseCase<FindMyBookingsUseCase.Input, FindMyBookingsUseCase.Result> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly bookingRepository: BookingRepository,
    ) {
        super();
    }

    async execute(params: FindMyBookingsUseCase.Input): Promise<FindMyBookingsUseCase.Result> {
        const { id: userId } = this.authUserService.getUser();
        const findAllParams: BookingRepository.FindAllParams = {
            pagination: PaginatedQuery.create(params.pagination),
            filter: params.filter ? {
                period: params.filter.period ? DatePeriod.fromPrimitive(params.filter.period) : undefined,
                userId,
                status: params.filter.status,
            } : undefined,
        }
        const bookings = await this.bookingRepository.findAll(findAllParams);
        return bookings.toJSON();
    }
}
namespace FindMyBookingsUseCase {
    const FilterSchema = z.object({
        period: DatePeriod.ValueSchema.optional(),
        status: z.array(z.enum(Booking.Status)).optional(),
    })

    export const InputSchema = z.object({
        pagination: PaginatedQuery.Schema,
        filter: FilterSchema.optional()
    })

    export const OutputSchema = PaginatedResult.JsonSchema(Booking.JsonSchema)

    export type Input = z.infer<typeof InputSchema>;
    export type Result = z.infer<typeof OutputSchema>;
}

export { FindMyBookingsUseCase };