import { UseCase } from "@core/base-classes";
import z from "zod";
import { RefreshTokenService } from "src/modules/identity/domain/services";

/**
 * Encerra a sessão persistente no servidor: revoga a família inteira do
 * refresh token. Sem isso o "sair" seria só cosmético — o token continuaria
 * válido no banco até expirar.
 *
 * Rota pública e idempotente: o cliente está descartando a própria sessão, e
 * um token já revogado/desconhecido não é erro.
 */
class LogoutUseCase extends UseCase<LogoutUseCase.Input, LogoutUseCase.Output> {
    constructor(
        private readonly refreshTokenService: RefreshTokenService
    ) {
        super();
    }

    async execute(input: LogoutUseCase.Input): Promise<LogoutUseCase.Output> {
        await this.refreshTokenService.revoke(input.refreshToken);
        return { success: true };
    }
}

namespace LogoutUseCase {
    export const InputSchema = z.object({
        refreshToken: z.string(),
    });

    export const OutputSchema = z.object({
        success: z.boolean(),
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { LogoutUseCase };
