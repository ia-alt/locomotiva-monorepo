import { UseCase } from "@core/base-classes";
import z from "zod";
import { AuthTokenService, PasswordHashService } from "src/modules/identity/domain/services";
import { GovbrPendingIdentityRepository, UserRepository } from "src/modules/identity/domain/repositories";
import {
    GovbrAdminLinkNotAllowedError,
    GovbrIntegrationDisabledError,
    GovbrInvalidAuthRequestError,
    InvalidCredentialsError,
} from "src/modules/identity/domain/errors";
import { Cpf } from "src/modules/identity/domain/value-objects/cpf";

/**
 * Vincula a identidade gov.br a uma conta local já existente, depois que a
 * pessoa prova posse digitando a senha daquela conta.
 *
 * Esta prova é o que separa "a Maria voltando para a conta dela" de "a Maria
 * caindo dentro da conta de quem cadastrou o CPF dela antes". Como o registro
 * é aberto e não valida posse do CPF, sem ela a federação abriria uma porta em
 * vez de fechar.
 *
 * O ticket é consumido ANTES da conferência da senha — de propósito. Assim um
 * mesmo login gov.br não permite tentativas repetidas de senha. O custo é que
 * errar a senha obriga a recomeçar; como a sessão no gov.br continua ativa,
 * são poucos cliques.
 */
class LinkGovbrToAccountUseCase implements UseCase<LinkGovbrToAccountUseCase.Input, LinkGovbrToAccountUseCase.Output> {
    constructor(
        private readonly govbrPendingIdentityRepository: GovbrPendingIdentityRepository,
        private readonly userRepository: UserRepository,
        private readonly passwordHashService: PasswordHashService,
        private readonly authTokenService: AuthTokenService,
        private readonly integracaoLigada: boolean,
    ) { }

    async execute(input: LinkGovbrToAccountUseCase.Input): Promise<LinkGovbrToAccountUseCase.Output> {
        // Chave geral: derruba as quatro rotas, não só o botão. Quem souber o
        // endereço continuaria chamando direto se a checagem ficasse no cliente.
        if (!this.integracaoLigada) {
            throw new GovbrIntegrationDisabledError();
        }

        const pendente = await this.govbrPendingIdentityRepository.consumeByTicket(input.ticket, new Date());
        if (!pendente) {
            throw new GovbrInvalidAuthRequestError();
        }

        // O CPF vem do comprovante gravado no servidor, nunca do cliente.
        const user = await this.userRepository.findByEmailOrCpf(Cpf.fromString(pendente.cpf));
        if (!user) {
            throw new GovbrInvalidAuthRequestError();
        }

        if (user.isAdmin()) {
            throw new GovbrAdminLinkNotAllowedError();
        }

        const passwordHash = user.getPasswordHash();
        if (!passwordHash) {
            // Conta ficou sem senha entre uma chamada e outra. Não há o que
            // provar; refazer o login resolve pelo caminho automático.
            throw new GovbrInvalidAuthRequestError();
        }

        const senhaConfere = await this.passwordHashService.check(input.password, passwordHash);
        if (!senhaConfere) {
            throw new InvalidCredentialsError();
        }

        // Anula a senha local: a partir daqui a conta entra só pelo gov.br.
        user.linkGovbrIdentity(pendente.govbrSub);
        await this.userRepository.save(user);

        const token = await this.authTokenService.generateToken(user);

        return {
            token: token.toJSON(),
            redirectTo: pendente.redirectTo,
        };
    }
}

namespace LinkGovbrToAccountUseCase {
    export const InputSchema = z.object({
        ticket: z.string().min(1),
        password: z.string().min(1),
    });

    export const OutputSchema = z.object({
        token: z.string(),
        redirectTo: z.string().nullable(),
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { LinkGovbrToAccountUseCase };
