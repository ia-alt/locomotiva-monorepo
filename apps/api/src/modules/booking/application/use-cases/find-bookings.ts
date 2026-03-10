import { Booking } from "@booking/domain/entities";
import { BookingRepository } from "@booking/domain/repositories";
import { UniqueId, UseCase } from "@core/base-classes";
import { DatePeriod, PaginatedQuery, PaginatedResult } from "@core/value-objects";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

class FindBookingsUseCase extends UseCase<FindBookingsUseCase.Input, FindBookingsUseCase.Result> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly bookingRepository: BookingRepository,
    ) {
        super();
    }

    async execute(params: FindBookingsUseCase.Input): Promise<FindBookingsUseCase.Result> {
        this.authUserService.checkIsAdmin();
        const findAllParams: BookingRepository.FindAllParams = {
            pagination: PaginatedQuery.create(params.pagination),
            filter: params.filter ? {
                period: params.filter.period ? DatePeriod.fromPrimitive(params.filter.period) : undefined,
                roomId: params.filter.roomId ? UniqueId.fromString(params.filter.roomId) : undefined,
                userId: params.filter.userId ? UniqueId.fromString(params.filter.userId) : undefined,
                status: params.filter.status,
            } : undefined,
        }
        const bookings = await this.bookingRepository.findAll(findAllParams);
        return bookings.toJSON();
    }
}
namespace FindBookingsUseCase {
    const FilterSchema = z.object({
        period: DatePeriod.ValueSchema.optional(),
        roomId: z.string().optional(),
        userId: z.string().optional(),
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

export { FindBookingsUseCase };