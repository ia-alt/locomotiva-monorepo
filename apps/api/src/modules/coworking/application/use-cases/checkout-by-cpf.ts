import { UseCase } from "@core/base-classes";
import { AccessLog } from "@coworking/domain/entities";
import { AccessService } from "@coworking/domain/services";
import { UserRepository } from "src/modules/identity/domain/repositories";
import { Cpf } from "src/modules/identity/domain/value-objects/cpf";
import z from "zod";

class CheckoutByCpfUseCase implements UseCase<CheckoutByCpfUseCase.Input, CheckoutByCpfUseCase.Output> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly accessService: AccessService,
    ) { }

    async execute(input: CheckoutByCpfUseCase.Input): Promise<CheckoutByCpfUseCase.Output> {
        const cpf = Cpf.fromString(input.cpf);
        const user = await this.userRepository.findByEmailOrCpf(cpf);

        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        // Compara data de nascimento no formato YYYY-MM-DD
        if (user.birthDate.toString() !== input.birthDate) {
            throw new Error("CPF ou data de nascimento incorretos");
        }

        const accessLog = await this.accessService.checkOutUser(user.id);

        return { ...accessLog.toJSON(), userName: user.firstName };
    }
}

namespace CheckoutByCpfUseCase {
    export const InputSchema = z.object({
        cpf: z.string().min(11, "CPF inválido"),
        birthDate: z.string(), // YYYY-MM-DD
    });

    export const OutputSchema = AccessLog.JsonSchema.extend({
        userName: z.string(),
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { CheckoutByCpfUseCase };
