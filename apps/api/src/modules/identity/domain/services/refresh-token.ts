import { User } from "../entities";
import { RefreshToken } from "../entities/refresh-token";
import { RefreshTokenRepository } from "../repositories/refresh-token";
import { UserRepository } from "../repositories";
import { AuthTokenService } from "./auth-token";
import { InvalidRefreshTokenError } from "../errors";

/**
 * Sessão persistente ("continuar conectado"), padrão refresh token com rotação.
 *
 * O token de ACESSO (JWT) continua curto e stateless; quem carrega a sessão
 * longa é o refresh token, que vive no banco e por isso é revogável. As três
 * operações da vida da sessão estão aqui — emitir no login, rotacionar no
 * refresh e revogar no logout — para que todos os caminhos de login (senha e
 * gov.br) emitam sessões idênticas e nenhum use case duplique as checagens.
 */
class RefreshTokenService {
    constructor(
        private readonly refreshTokenRepository: RefreshTokenRepository,
        private readonly userRepository: UserRepository,
        private readonly authTokenService: AuthTokenService,
        /** Vem do env via container; o domínio não lê configuração. */
        private readonly refreshTtlSegundos: number,
    ) { }

    /** Abre uma sessão nova (família nova). Chamado por todo login bem-sucedido. */
    async issueSession(user: User): Promise<RefreshTokenService.SessionTokens> {
        const { token, rawToken } = RefreshToken.create({
            userId: user.id,
            validoPorSegundos: this.refreshTtlSegundos,
        });
        await this.refreshTokenRepository.save(token);

        const accessToken = await this.authTokenService.generateToken(user);
        return { token: accessToken.toJSON(), refreshToken: rawToken };
    }

    /**
     * Troca um refresh token válido por um par novo (rotação).
     *
     * A validade da sessão é DESLIZANTE: o sucessor nasce com o TTL cheio, então
     * quem usa o app segue conectado indefinidamente — só cai quem ficar o TTL
     * inteiro sem entrar, ou quem clicar em sair.
     *
     * Reuso de um token já rotacionado significa que duas partes têm o mesmo
     * valor — o titular e, possivelmente, um ladrão. Como não dá para saber qual
     * dos dois chegou primeiro, a família inteira cai e a pessoa refaz o login.
     */
    async rotate(rawToken: string): Promise<RefreshTokenService.SessionTokens> {
        const agora = new Date();
        const tokenHash = RefreshToken.hashRawToken(rawToken);

        const consumido = await this.refreshTokenRepository.consumeByTokenHash(tokenHash, agora);
        if (!consumido) {
            const existente = await this.refreshTokenRepository.findByTokenHash(tokenHash);
            if (existente?.wasUsed()) {
                await this.refreshTokenRepository.revokeFamily(existente.familyId, agora);
            }
            throw new InvalidRefreshTokenError();
        }

        const user = await this.userRepository.findById(consumido.userId);
        if (!user) {
            await this.refreshTokenRepository.revokeFamily(consumido.familyId, agora);
            throw new InvalidRefreshTokenError();
        }

        const { token: sucessor, rawToken: novoRawToken } = RefreshToken.create({
            userId: user.id,
            familyId: consumido.familyId,
            validoPorSegundos: this.refreshTtlSegundos,
        });
        await this.refreshTokenRepository.save(sucessor);

        const accessToken = await this.authTokenService.generateToken(user);
        return { token: accessToken.toJSON(), refreshToken: novoRawToken };
    }

    /**
     * Encerra a sessão no servidor (logout). Idempotente de propósito: um
     * token desconhecido não é erro — a sessão que ele representava já não
     * existe, que é exatamente o estado desejado.
     */
    async revoke(rawToken: string): Promise<void> {
        const tokenHash = RefreshToken.hashRawToken(rawToken);
        const existente = await this.refreshTokenRepository.findByTokenHash(tokenHash);
        if (!existente) {
            return;
        }
        await this.refreshTokenRepository.revokeFamily(existente.familyId, new Date());
    }
}

namespace RefreshTokenService {
    export type SessionTokens = {
        /** JWT de acesso, curto — vai no header Authorization. */
        token: string;
        /** Valor cru do refresh token — o cliente guarda e só usa no refresh/logout. */
        refreshToken: string;
    };
}

export { RefreshTokenService };
