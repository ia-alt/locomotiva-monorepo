import { UseCase } from "@core/base-classes";
import z from "zod";
import { RefreshTokenService } from "src/modules/identity/domain/services";

/**
 * Troca um refresh token válido por um par novo de tokens (rotação).
 *
 * É o que mantém a pessoa conectada sem refazer login: quando o token de
 * acesso expira, o cliente chama aqui e segue trabalhando. Rota pública — a
 * credencial é o próprio refresh token.
 */
class RefreshSessionUseCase extends UseCase<RefreshSessionUseCase.Input, RefreshSessionUseCase.Output> {
    constructor(
        private readonly refreshTokenService: RefreshTokenService
    ) {
        super();
    }

    async execute(input: RefreshSessionUseCase.Input): Promise<RefreshSessionUseCase.Output> {
        const session = await this.refreshTokenService.rotate(input.refreshToken);

        return {
            token: session.token,
            refreshToken: session.refreshToken,
        };
    }
}

namespace RefreshSessionUseCase {
    export const InputSchema = z.object({
        refreshToken: z.string(),
    });

    export const OutputSchema = z.object({
        token: z.string(),
        refreshToken: z.string(),
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { RefreshSessionUseCase };
