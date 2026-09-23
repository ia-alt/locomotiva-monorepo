/**
 * Porta para o Login Único gov.br (OpenID Connect sobre OAuth 2.0).
 *
 * Não existe método que devolva token cru de propósito: a única forma de obter
 * identidade é `exchangeCodeForIdentity`, que só retorna DEPOIS de validar
 * assinatura (JWKS/RS256), `iss`, `aud`, `exp` e `nonce`. Isso torna impossível,
 * por construção, alguém autenticar alguém com um token não verificado.
 *
 * Endpoints confirmados no discovery de homologação (2026-08-05):
 *   authorize https://sso.staging.acesso.gov.br/authorize
 *   token     https://sso.staging.acesso.gov.br/token
 *   userinfo  https://sso.staging.acesso.gov.br/userinfo
 *   jwks      https://sso.staging.acesso.gov.br/jwk
 */
export interface GovbrOidcService {
    /** Monta a URL do /authorize. O código de verificação PKCE fica com o chamador. */
    buildAuthorizationUrl(params: GovbrOidcService.AuthorizationParams): string;

    /** Troca o `code` por tokens e devolve a identidade já validada. */
    exchangeCodeForIdentity(params: GovbrOidcService.ExchangeParams): Promise<GovbrIdentity>;

    /** Gera `code_verifier` (43–128 chars) e o `code_challenge` S256 correspondente. */
    createPkcePair(): GovbrOidcService.PkcePair;

    /** URL de logout federado. Encerra a sessão no gov.br, não só a nossa. */
    buildLogoutUrl(postLogoutRedirectUri: string): string;
}

export namespace GovbrOidcService {
    export type AuthorizationParams = {
        state: string;
        nonce: string;
        codeChallenge: string;
    };

    export type ExchangeParams = {
        code: string;
        codeVerifier: string;
        /** Precisa bater com o `nonce` enviado no /authorize — barra replay. */
        expectedNonce: string;
    };

    export type PkcePair = {
        codeVerifier: string;
        codeChallenge: string;
    };
}

/**
 * Identidade devolvida pelo gov.br, já verificada.
 *
 * O que o provedor NÃO entrega: data de nascimento. Confirmado na página de
 * Escopos de Atributos e no exemplo oficial do /userinfo. Por isso o
 * provisionamento exige uma etapa de "complete seu cadastro".
 */
export type GovbrIdentity = {
    /** Claim `sub` bruto. String opaca — o formato não é garantido pelo provedor. */
    sub: string;
    /** Do claim `preferred_username`, que o roteiro documenta como o CPF. */
    cpf: string;
    name: string;
    socialName: string | null;
    /** Só preenchido quando `email_verified` for verdadeiro. */
    email: string | null;
    /** Só preenchido quando `phone_number_verified` for verdadeiro. */
    phone: string | null;
    picture: string | null;
};
