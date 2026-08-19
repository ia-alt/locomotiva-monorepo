import { UseCase } from "@core/base-classes";
import z from "zod";
import { AuthTokenService, GovbrIdentity, GovbrOidcService } from "src/modules/identity/domain/services";
import {
    GovbrAuthRequestRepository,
    GovbrPendingIdentityRepository,
    UserRepository,
} from "src/modules/identity/domain/repositories";
import { GovbrPendingIdentity, User } from "src/modules/identity/domain/entities";
import {
    GovbrIntegrationDisabledError,
    GovbrInvalidAuthRequestError,
} from "src/modules/identity/domain/errors";
import { Cpf } from "src/modules/identity/domain/value-objects/cpf";

/**
 * Fecha o login pelo gov.br e decide o que fazer com a conta.
 *
 * São três desfechos, e o cliente reage a cada um:
 *
 *   `authenticated`       entrou; token emitido
 *   `needs_password_link` já existe conta COM senha neste CPF; precisa provar posse
 *   `needs_profile`       CPF novo; faltam os dados que o gov.br não fornece
 *
 * A ordem de resolução é `govbrSub` primeiro, CPF depois. Nunca por e-mail:
 * e-mail é alterável sem verificação (`update-me.ts`), então usá-lo como chave
 * permitiria plantar uma colisão de propósito.
 */
class CompleteGovbrLoginUseCase implements UseCase<CompleteGovbrLoginUseCase.Input, CompleteGovbrLoginUseCase.Output> {
    constructor(
        private readonly govbrOidcService: GovbrOidcService,
        private readonly govbrAuthRequestRepository: GovbrAuthRequestRepository,
        private readonly govbrPendingIdentityRepository: GovbrPendingIdentityRepository,
        private readonly userRepository: UserRepository,
        private readonly authTokenService: AuthTokenService,
        private readonly integracaoLigada: boolean,
    ) { }

    async execute(input: CompleteGovbrLoginUseCase.Input): Promise<CompleteGovbrLoginUseCase.Output> {
        // Chave geral: derruba as quatro rotas, não só o botão. Quem souber o
        // endereço continuaria chamando direto se a checagem ficasse no cliente.
        if (!this.integracaoLigada) {
            throw new GovbrIntegrationDisabledError();
        }

        // 1. Consome o pedido. `state` desconhecido, já usado ou expirado dão o
        //    mesmo erro, para não confirmar a um atacante que ele existiu.
        const request = await this.govbrAuthRequestRepository.consumeByState(input.state, new Date());
        if (!request) {
            throw new GovbrInvalidAuthRequestError();
        }

        // 2. Troca o código e valida assinatura, iss, aud, exp e nonce.
        const identity = await this.govbrOidcService.exchangeCodeForIdentity({
            code: input.code,
            codeVerifier: request.codeVerifier,
            expectedNonce: request.nonce,
        });

        // 3. Já vinculado: caminho feliz e mais comum depois do primeiro acesso.
        const jaVinculado = await this.userRepository.findByGovbrSub(identity.sub);
        if (jaVinculado) {
            return this.autenticar(jaVinculado, request.redirectTo);
        }

        // 4. Existe conta local com este CPF?
        const porCpf = await this.userRepository.findByEmailOrCpf(Cpf.fromString(identity.cpf));

        if (porCpf) {
            // Conta sem senha: não há dono a provar, então vincula direto. É o
            // caso de quem começou pelo gov.br e parou no meio do cadastro.
            if (!porCpf.hasLocalPassword()) {
                porCpf.linkGovbrIdentity(identity.sub);
                await this.userRepository.save(porCpf);
                return this.autenticar(porCpf, request.redirectTo);
            }

            // Conta COM senha: qualquer pessoa pode ter cadastrado este CPF, já
            // que o registro é aberto e não prova posse. Vincular aqui entregaria
            // a sessão da vítima a quem cadastrou o CPF dela antes.
            const pendente = await this.registrarPendencia(identity, request.redirectTo);
            return {
                status: "needs_password_link",
                token: null,
                redirectTo: request.redirectTo,
                ticket: pendente.ticket,
                name: pendente.name,
                maskedEmail: mascararEmail(porCpf.email.toString()),
            };
        }

        // 5. CPF novo. Falta a data de nascimento, que o gov.br não fornece e é
        //    exigida pelo check-in no totem.
        const pendente = await this.registrarPendencia(identity, request.redirectTo);
        return {
            status: "needs_profile",
            token: null,
            redirectTo: request.redirectTo,
            ticket: pendente.ticket,
            name: pendente.name,
            maskedEmail: pendente.email === null ? null : mascararEmail(pendente.email),
        };
    }

    private async autenticar(user: User, redirectTo: string | null): Promise<CompleteGovbrLoginUseCase.Output> {
        // Os tokens do gov.br morrem aqui: não são persistidos nem registrados
        // em log. O provedor não expõe endpoint de revogação, então guardá-los
        // criaria um segredo que não teríamos como invalidar.
        const token = await this.authTokenService.generateToken(user);
        return {
            status: "authenticated",
            token: token.toJSON(),
            redirectTo,
            ticket: null,
            name: null,
            maskedEmail: null,
        };
    }

    private async registrarPendencia(
        identity: GovbrIdentity,
        redirectTo: string | null,
    ): Promise<GovbrPendingIdentity> {
        const pendente = GovbrPendingIdentity.create({ identity, redirectTo });
        await this.govbrPendingIdentityRepository.save(pendente);
        return pendente;
    }
}

/** Mostra o suficiente para a pessoa reconhecer a conta, sem revelar o endereço. */
function mascararEmail(email: string): string {
    const [local, dominio] = email.split("@");
    if (!dominio) return "***";
    const localMascarado = local.length <= 2
        ? `${local[0]}*`
        : `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}`;
    return `${localMascarado}@${dominio}`;
}

namespace CompleteGovbrLoginUseCase {
    export const InputSchema = z.object({
        code: z.string().min(1),
        state: z.string().min(1),
    });

    export const OutputSchema = z.object({
        status: z.enum(["authenticated", "needs_password_link", "needs_profile"]),
        /** Preenchido só em `authenticated`. */
        token: z.string().nullable(),
        redirectTo: z.string().nullable(),
        /** Comprovante para concluir o login nos outros dois desfechos. */
        ticket: z.string().nullable(),
        name: z.string().nullable(),
        maskedEmail: z.string().nullable(),
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { CompleteGovbrLoginUseCase };
