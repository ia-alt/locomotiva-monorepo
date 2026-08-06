import { UseCase } from "@core/base-classes";
import z from "zod";
import { EmailAddress } from "@core/value-objects";
import { AuthTokenService } from "src/modules/identity/domain/services";
import { GovbrPendingIdentityRepository, UserRepository } from "src/modules/identity/domain/repositories";
import { User } from "src/modules/identity/domain/entities";
import {
    GovbrEmailAlreadyInUseError,
    GovbrEmailUnavailableError,
    GovbrIntegrationDisabledError,
    GovbrInvalidAuthRequestError,
    UserAlreadyExistsWithEmailOrCpfError,
} from "src/modules/identity/domain/errors";
import { Cpf } from "src/modules/identity/domain/value-objects/cpf";
import { BirthDate } from "src/modules/identity/domain/value-objects/birth-date";

/**
 * Cria a conta de quem entrou pelo gov.br pela primeira vez, com os dados que o
 * provedor não fornece.
 *
 * Data de nascimento não é capricho de formulário: o totem identifica a pessoa
 * por CPF + data de nascimento (`checkin-by-cpf.ts`). Sem ela, a conta nasceria
 * sem conseguir fazer check-in.
 *
 * Nome, e-mail e CPF vêm do comprovante gravado no servidor — nunca do cliente.
 */
class CompleteGovbrRegistrationUseCase implements UseCase<CompleteGovbrRegistrationUseCase.Input, CompleteGovbrRegistrationUseCase.Output> {
    constructor(
        private readonly govbrPendingIdentityRepository: GovbrPendingIdentityRepository,
        private readonly userRepository: UserRepository,
        private readonly authTokenService: AuthTokenService,
        private readonly integracaoLigada: boolean,
    ) { }

    async execute(input: CompleteGovbrRegistrationUseCase.Input): Promise<CompleteGovbrRegistrationUseCase.Output> {
        // Chave geral: derruba as quatro rotas, não só o botão. Quem souber o
        // endereço continuaria chamando direto se a checagem ficasse no cliente.
        if (!this.integracaoLigada) {
            throw new GovbrIntegrationDisabledError();
        }

        const pendente = await this.govbrPendingIdentityRepository.consumeByTicket(input.ticket, new Date());
        if (!pendente) {
            throw new GovbrInvalidAuthRequestError();
        }

        // O gov.br só entrega `email` quando ele está verificado. Sem e-mail não
        // dá para criar a conta — a coluna é NOT NULL e única —, e inventar um
        // endereço sintético quebraria toda a comunicação com a pessoa.
        if (!pendente.email) {
            throw new GovbrEmailUnavailableError();
        }

        const email = EmailAddress.fromString(pendente.email);
        const cpf = Cpf.fromString(pendente.cpf);

        // Entre a validação no gov.br e esta chamada, alguém pode ter criado uma
        // conta com o mesmo CPF. Sem esta checagem, o erro viraria uma violação
        // de índice único do Postgres — um 500 sem mensagem útil.
        const jaExistePorCpf = await this.userRepository.findByEmailOrCpf(cpf);
        if (jaExistePorCpf) {
            throw new UserAlreadyExistsWithEmailOrCpfError();
        }

        // E-mail do gov.br pertencendo a OUTRO cadastro é conflito real, que só
        // uma pessoa pode resolver. Merece erro próprio, não um 500 genérico.
        const jaExistePorEmail = await this.userRepository.findByEmailOrCpf(email);
        if (jaExistePorEmail) {
            throw new GovbrEmailAlreadyInUseError();
        }

        const user = User.createFederated({
            name: pendente.name,
            email,
            cpf,
            birthDate: BirthDate.fromJSON(input.birthDate),
            govbrSub: pendente.govbrSub,
            phone: input.phone,
            company: input.company,
            jobTitle: input.jobTitle,
        });

        await this.userRepository.save(user);

        const token = await this.authTokenService.generateToken(user);

        return {
            token: token.toJSON(),
            redirectTo: pendente.redirectTo,
        };
    }
}

namespace CompleteGovbrRegistrationUseCase {
    export const InputSchema = z.object({
        ticket: z.string().min(1),
        birthDate: BirthDate.JsonSchema,
        phone: z.string().min(1),
        company: z.string().nullable().optional(),
        jobTitle: z.string().nullable().optional(),
    });

    export const OutputSchema = z.object({
        token: z.string(),
        redirectTo: z.string().nullable(),
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { CompleteGovbrRegistrationUseCase };
