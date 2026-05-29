import { BookingService } from "@booking/domain/services";
import { UniqueId, UseCase } from "@core/base-classes";
import { OnlyDate } from "@core/value-objects";
import { AuthUserService } from "src/modules/identity/domain/services";
import { TimeInterval } from "src/modules/operating-hours/domain/value-objects/time-interval";
import z from "zod";

class ListAvailableSlotsByDayUseCase extends UseCase<ListAvailableSlotsByDayUseCase.Input, ListAvailableSlotsByDayUseCase.Output> {

    constructor(
        private readonly _: AuthUserService,
        private readonly bookingService: BookingService,
    ) {
        super();
    }

    async execute(params: ListAvailableSlotsByDayUseCase.Input): Promise<ListAvailableSlotsByDayUseCase.Output> {
        const roomId = UniqueId.fromString(params.roomId);
        const day = new OnlyDate(params.day);

        const slots = await this.bookingService.getAvailableDailySlotsByRoom(roomId, day);
        return { slots: slots.map(x => x.toJSON()) };
    }

}

namespace ListAvailableSlotsByDayUseCase {
    export const InputSchema = z.object({
        roomId: z.string(),
        day: OnlyDate.ValueSchema,
    });

    export const OutputSchema = z.object({
        slots: z.array(TimeInterval.JsonSchema),
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;

}

export { ListAvailableSlotsByDayUseCase };
