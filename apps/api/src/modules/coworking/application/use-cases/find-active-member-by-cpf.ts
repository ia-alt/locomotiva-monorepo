import { UseCase } from "@core/base-classes";
import { AccessLogRepository } from "@coworking/domain/repositories";
import { UserRepository } from "src/modules/identity/domain/repositories";
import { Cpf } from "src/modules/identity/domain/value-objects/cpf";
import z from "zod";

class FindActiveMemberByCpfUseCase implements UseCase<FindActiveMemberByCpfUseCase.Input, FindActiveMemberByCpfUseCase.Output> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly accessLogRepository: AccessLogRepository,
    ) { }

    async execute(input: FindActiveMemberByCpfUseCase.Input): Promise<FindActiveMemberByCpfUseCase.Output> {
        const cpf = Cpf.fromString(input.cpf);
        const user = await this.userRepository.findByEmailOrCpf(cpf);

        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const activeLog = await this.accessLogRepository.findByUserIdAndActive(user.id);

        if (!activeLog) {
            throw new Error("Nenhum check-in ativo encontrado");
        }

        return { userName: user.firstName };
    }
}

namespace FindActiveMemberByCpfUseCase {
    export const InputSchema = z.object({
        cpf: z.string().min(11, "CPF inválido"),
    });

    export const OutputSchema = z.object({
        userName: z.string(),
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { FindActiveMemberByCpfUseCase };
