import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { env } from "@env";
import {
    GovbrIdentity,
    GovbrOidcService,
} from "src/modules/identity/domain/services/govbr-oidc";
import {
    GovbrAuthenticationFailedError,
    GovbrNotConfiguredError,
} from "src/modules/identity/domain/errors";

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Implementação do Login Único gov.br com `jose` para validar RS256 via JWKS.
 *
 * O construtor exige as variáveis de ambiente. Como o container instancia sob
 * demanda (lazy), a API continua subindo normalmente sem credencial — só quebra
 * quem tentar usar a integração, com erro nomeando a variável faltante.
 */
export class OpenIdGovbrOidcService implements GovbrOidcService {
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly baseUrl: string;
    private readonly redirectUri: string;
    private readonly scopes: string;
    private readonly prompt: string | undefined;
    private readonly maxAge: number | undefined;
    private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

    constructor() {
        this.clientId = requireEnv("GOVBR_CLIENT_ID", env.GOVBR_CLIENT_ID);
        this.clientSecret = requireEnv("GOVBR_CLIENT_SECRET", env.GOVBR_CLIENT_SECRET);
        this.redirectUri = requireEnv("GOVBR_REDIRECT_URI", env.GOVBR_REDIRECT_URI);

        this.baseUrl = env.GOVBR_ISSUER.replace(/\/+$/, "");
        this.scopes = env.GOVBR_SCOPES;
        this.prompt = env.GOVBR_PROMPT;
        this.maxAge = env.GOVBR_MAX_AGE;
        this.jwks = createRemoteJWKSet(new URL(`${this.baseUrl}/jwk`));
    }

    createPkcePair(): GovbrOidcService.PkcePair {
        // 32 bytes em base64url = 43 chars, o mínimo que o roteiro exige.
        const codeVerifier = randomBytes(32).toString("base64url");
        const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
        return { codeVerifier, codeChallenge };
    }

    buildAuthorizationUrl(params: GovbrOidcService.AuthorizationParams): string {
        const url = new URL(`${this.baseUrl}/authorize`);
        url.searchParams.set("response_type", "code");
        url.searchParams.set("client_id", this.clientId);
        url.searchParams.set("scope", this.scopes);
        url.searchParams.set("redirect_uri", this.redirectUri);
        url.searchParams.set("nonce", params.nonce);
        url.searchParams.set("state", params.state);
        url.searchParams.set("code_challenge", params.codeChallenge);
        url.searchParams.set("code_challenge_method", "S256");

        // Sem estes, o gov.br reaproveita a sessão que a pessoa já tem no
        // navegador e entra sem pedir senha — inclusive logo após ela sair
        // daqui. `prompt=login` recusa essa sessão; `max_age` a aceita apenas
        // se for recente. Ambos são do OpenID Connect Core, não do gov.br: o
        // discovery deles não os declara, então confirme por teste antes de
        // depender do comportamento (ver ARQUITETURA-GOVBR.md).
        if (this.prompt) {
            url.searchParams.set("prompt", this.prompt);
        }
        if (this.maxAge !== undefined) {
            url.searchParams.set("max_age", String(this.maxAge));
        }

        return url.toString();
    }

    buildLogoutUrl(postLogoutRedirectUri: string): string {
        const url = new URL(`${this.baseUrl}/logout`);
        url.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);
        return url.toString();
    }

    async exchangeCodeForIdentity(params: GovbrOidcService.ExchangeParams): Promise<GovbrIdentity> {
        const idToken = await this.requestIdToken(params);
        const claims = await this.verifyIdToken(idToken, params.expectedNonce);
        return this.claimsToIdentity(claims);
    }

    /** Passo 6 do roteiro: POST /token com Basic auth e o code_verifier do PKCE. */
    private async requestIdToken(params: GovbrOidcService.ExchangeParams): Promise<string> {
        const basic = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");

        const body = new URLSearchParams({
            grant_type: "authorization_code",
            code: params.code,
            redirect_uri: this.redirectUri,
            code_verifier: params.codeVerifier,
        });

        let response: Response;
        try {
            response = await fetch(`${this.baseUrl}/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Basic ${basic}`,
                    Accept: "application/json",
                },
                body,
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            });
        } catch {
            throw new GovbrAuthenticationFailedError("provedor indisponível");
        }

        if (!response.ok) {
            // Só o código do erro entra na mensagem. `error_description` costuma
            // ecoar valores da requisição e não deve circular em log nem resposta.
            const code = await safeErrorCode(response);
            throw new GovbrAuthenticationFailedError(`${response.status} ${code}`);
        }

        const payload = await response.json().catch(() => null) as { id_token?: unknown } | null;
        if (!payload || typeof payload.id_token !== "string") {
            throw new GovbrAuthenticationFailedError("resposta sem id_token");
        }

        return payload.id_token;
    }

    /** Passo 7: assinatura via JWKS, mais iss/aud/exp e o nonce contra replay. */
    private async verifyIdToken(idToken: string, expectedNonce: string): Promise<JWTPayload> {
        let claims: JWTPayload;
        try {
            const verified = await jwtVerify(idToken, this.jwks, {
                // O discovery publica o issuer COM barra final; aceitamos as duas
                // formas para não quebrar se o provedor mudar a serialização.
                issuer: [this.baseUrl, `${this.baseUrl}/`],
                audience: this.clientId,
                algorithms: ["RS256", "RS512"],
                clockTolerance: 60,
            });
            claims = verified.payload;
        } catch {
            throw new GovbrAuthenticationFailedError("id_token inválido");
        }

        if (claims.nonce !== expectedNonce) {
            throw new GovbrAuthenticationFailedError("nonce divergente");
        }

        return claims;
    }

    private claimsToIdentity(claims: JWTPayload): GovbrIdentity {
        // Conta de pessoa jurídica traz `cnpj` e o identificador deixa de ser CPF.
        // Barrado aqui para não estourar InvalidCpfError genérico lá na frente.
        if (claims.cnpj) {
            throw new GovbrAuthenticationFailedError("conta de pessoa jurídica não é aceita");
        }

        const sub = typeof claims.sub === "string" ? claims.sub : "";
        if (!sub) {
            throw new GovbrAuthenticationFailedError("id_token sem sub");
        }

        // O roteiro documenta `preferred_username` como o CPF, e nos exemplos
        // oficiais ele vem sem pontuação — enquanto o `sub` aparece ora com
        // hífen, ora sem. Por isso o CPF sai daqui, e o `sub` fica opaco.
        const rawCpf = asString(claims.preferred_username) ?? sub;
        const cpf = rawCpf.replace(/\D/g, "");
        if (cpf.length !== 11) {
            throw new GovbrAuthenticationFailedError("não foi possível obter o CPF");
        }

        const name = asString(claims.name);
        if (!name) {
            throw new GovbrAuthenticationFailedError("id_token sem nome");
        }

        return {
            sub,
            cpf,
            name,
            socialName: asString(claims.social_name),
            // Descartados quando não verificados: um e-mail não confirmado pelo
            // gov.br não é prova de nada e não pode virar chave de conta.
            email: isTrue(claims.email_verified) ? asString(claims.email) : null,
            phone: isTrue(claims.phone_number_verified) ? asString(claims.phone_number) : null,
            picture: asString(claims.picture),
        };
    }
}

function requireEnv(name: string, value: string | undefined): string {
    if (!value) {
        throw new GovbrNotConfiguredError(name);
    }
    return value;
}

function asString(value: unknown): string | null {
    return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

/**
 * O gov.br serializa os flags `*_verified` de forma inconsistente: BOOLEAN no
 * /userinfo e STRING "true" no id_token. Comparar com `=== true` faz o login
 * falhar na leitura das claims, não na assinatura — sintoma difícil de rastrear.
 */
function isTrue(value: unknown): boolean {
    return value === true || value === "true";
}

async function safeErrorCode(response: Response): Promise<string> {
    try {
        const body = await response.json() as { error?: unknown };
        return asString(body?.error) ?? "erro desconhecido";
    } catch {
        return "erro desconhecido";
    }
}
