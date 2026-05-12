import { UseCase } from "@core/base-classes";
import { AccessLogService } from "@coworking/domain/services";
import { AuthUserService } from "src/modules/identity/domain/services";
import { OnlyDate } from "@core/value-objects";
import z from "zod";
import { AccessLogWithUser } from "../../domain/value-objects/access-log-with-user";

class ListAccessLogsByDayUseCase implements UseCase<ListAccessLogsByDayUseCase.Input, ListAccessLogsByDayUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly accessLogService: AccessLogService,
    ) { }

    async execute(input: ListAccessLogsByDayUseCase.Input): Promise<ListAccessLogsByDayUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const day = new OnlyDate(input.day);
        const items = await this.accessLogService.findAllByDayWithUsers(day);

        return items.map((accessLogWithUser) => accessLogWithUser.toJSON());
    }
}

namespace ListAccessLogsByDayUseCase {
    export const InputSchema = z.object({
        day: OnlyDate.ValueSchema,
    });

    export const OutputSchema = z.array(AccessLogWithUser.JsonSchema);

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { ListAccessLogsByDayUseCase };
