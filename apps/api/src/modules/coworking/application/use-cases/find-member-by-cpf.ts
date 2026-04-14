import { UseCase } from "@core/base-classes";
import { UserRepository } from "src/modules/identity/domain/repositories";
import { Cpf } from "src/modules/identity/domain/value-objects/cpf";
import z from "zod";

class FindMemberByCpfUseCase implements UseCase<FindMemberByCpfUseCase.Input, FindMemberByCpfUseCase.Output> {
    constructor(
        private readonly userRepository: UserRepository,
    ) { }

    async execute(input: FindMemberByCpfUseCase.Input): Promise<FindMemberByCpfUseCase.Output> {
        const cpf = Cpf.fromString(input.cpf);
        const user = await this.userRepository.findByEmailOrCpf(cpf);

        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        return { userName: user.firstName };
    }
}

namespace FindMemberByCpfUseCase {
    export const InputSchema = z.object({
        cpf: z.string().min(11, "CPF inválido"),
    });

    export const OutputSchema = z.object({
        userName: z.string(),
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { FindMemberByCpfUseCase };
