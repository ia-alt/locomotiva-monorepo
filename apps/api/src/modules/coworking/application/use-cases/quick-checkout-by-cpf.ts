import { UseCase } from "@core/base-classes";
import { AccessLog } from "@coworking/domain/entities";
import { AccessService } from "@coworking/domain/services";
import { UserRepository } from "src/modules/identity/domain/repositories";
import { Cpf } from "src/modules/identity/domain/value-objects/cpf";
import z from "zod";

class QuickCheckoutByCpfUseCase implements UseCase<QuickCheckoutByCpfUseCase.Input, QuickCheckoutByCpfUseCase.Output> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly accessService: AccessService,
    ) { }

    async execute(input: QuickCheckoutByCpfUseCase.Input): Promise<QuickCheckoutByCpfUseCase.Output> {
        const cpf = Cpf.fromString(input.cpf);
        const user = await this.userRepository.findByEmailOrCpf(cpf);

        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const accessLog = await this.accessService.checkOutUser(user.id);

        return { ...accessLog.toJSON(), userName: user.firstName };
    }
}

namespace QuickCheckoutByCpfUseCase {
    export const InputSchema = z.object({
        cpf: z.string().min(11, "CPF inválido"),
    });

    export const OutputSchema = AccessLog.JsonSchema.extend({
        userName: z.string(),
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { QuickCheckoutByCpfUseCase };
