import { UseCase } from "@core/base-classes";
import z from "zod";
import { GovbrOidcService } from "src/modules/identity/domain/services";
import { GovbrAuthRequestRepository } from "src/modules/identity/domain/repositories";
import { GovbrAuthRequest } from "src/modules/identity/domain/entities";
import {
    GovbrIntegrationDisabledError,
    InvalidRedirectTargetError,
} from "src/modules/identity/domain/errors";

/**
 * Começa um login pelo gov.br: gera o par PKCE, registra o pedido e devolve a
 * URL do /authorize.
 *
 * O `state`, o `nonce` e o `code_verifier` ficam guardados no servidor. O
 * cliente recebe apenas a URL — não tem como (nem por que) conhecer os segredos.
 */
class StartGovbrLoginUseCase implements UseCase<StartGovbrLoginUseCase.Input, StartGovbrLoginUseCase.Output> {
    constructor(
        private readonly govbrOidcService: GovbrOidcService,
        private readonly govbrAuthRequestRepository: GovbrAuthRequestRepository,
        private readonly integracaoLigada: boolean,
    ) { }

    async execute(input: StartGovbrLoginUseCase.Input): Promise<StartGovbrLoginUseCase.Output> {
        // Chave geral: derruba as quatro rotas, não só o botão. Quem souber o
        // endereço continuaria chamando direto se a checagem ficasse no cliente.
        if (!this.integracaoLigada) {
            throw new GovbrIntegrationDisabledError();
        }

        const redirectTo = normalizarDestinoInterno(input.redirectTo);

        const { codeVerifier, codeChallenge } = this.govbrOidcService.createPkcePair();

        const request = GovbrAuthRequest.create({ codeVerifier, redirectTo });
        await this.govbrAuthRequestRepository.save(request);

        return {
            authorizationUrl: this.govbrOidcService.buildAuthorizationUrl({
                state: request.state,
                nonce: request.nonce,
                codeChallenge,
            }),
        };
    }
}

/**
 * Aceita só caminho relativo dentro da aplicação.
 *
 * Sem isso, `redirectTo` vira open redirect — e não do tipo inofensivo: como
 * ele é usado DEPOIS do login, o atacante levaria embora a sessão recém-criada.
 * Recusado: qualquer coisa com esquema (`https:`, `javascript:`), começando com
 * `//` (URL protocolo-relativa) ou com `\` (que alguns navegadores normalizam
 * para `/`).
 */
function normalizarDestinoInterno(valor: string | null | undefined): string | null {
    if (!valor) return null;

    const limpo = valor.trim();
    if (limpo === "") return null;

    const ehCaminhoRelativo =
        limpo.startsWith("/") &&
        !limpo.startsWith("//") &&
        !limpo.startsWith("/\\") &&
        !limpo.includes("\\") &&
        !/^\/*[a-zA-Z][a-zA-Z0-9+.-]*:/.test(limpo);

    if (!ehCaminhoRelativo) {
        throw new InvalidRedirectTargetError();
    }

    return limpo;
}

namespace StartGovbrLoginUseCase {
    export const InputSchema = z.object({
        /** Caminho interno para onde levar o usuário após o login. Ex.: "/reservas". */
        redirectTo: z.string().nullable().optional(),
    });

    export const OutputSchema = z.object({
        authorizationUrl: z.string(),
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { StartGovbrLoginUseCase };
