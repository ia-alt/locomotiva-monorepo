import { UseCase } from "@core/base-classes";
import z from "zod";
import { AccessService } from "@coworking/domain/services";

class AutoCheckoutAllUseCase implements UseCase<AutoCheckoutAllUseCase.Input, AutoCheckoutAllUseCase.Output> {
    constructor(
        private readonly accessService: AccessService,
    ) { }

    async execute(): Promise<AutoCheckoutAllUseCase.Output> {

        const result = await this.accessService.checkOutAll();

        return result;
    }
}

namespace AutoCheckoutAllUseCase {
    export const InputSchema = z.void();

    export const OutputSchema = z.object({
        processedCount: z.number(),
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { AutoCheckoutAllUseCase };
