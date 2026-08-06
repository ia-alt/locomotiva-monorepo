/**
 * Descobre qual `redirect_uri` está cadastrada na credencial.
 *
 *   npx tsx scripts/govbr-descobrir-redirect.ts
 *
 * Imprime uma lista de URLs de /authorize, cada uma com um redirect_uri
 * candidato. Abra uma por uma no navegador (a sessão do gov.br continua ativa
 * depois do primeiro login, então as seguintes são instantâneas) e veja:
 *
 *   Erro: invalid_grant  ->  essa NÃO é a cadastrada, tente a próxima
 *   redirecionou com ?code=  ->  ACHOU. É essa.
 *
 * Nenhuma dessas chamadas troca token nem usa o client_secret — só descobrem
 * qual URL o provedor aceita.
 *
 * ATALHO: o Portal do Serviço de Integração mostra o valor cadastrado sem
 * adivinhação. Botão "Acompanhamento" > dados da integração. Se você tiver
 * acesso a ele, use, é mais rápido e confiável do que este script.
 */
import "dotenv/config";

const ISSUER = (process.env.GOVBR_ISSUER ?? "https://sso.staging.acesso.gov.br").replace(/\/+$/, "");
const CLIENT_ID = process.env.GOVBR_CLIENT_ID?.trim();

// O client_id do gov.br costuma ser "h-" + o domínio do sistema. Extraímos daí
// o palpite mais forte, em vez de chutar no escuro.
const dominioDoClientId = CLIENT_ID?.replace(/^h-/, "") ?? "";

const CAMINHOS = [
    "/auth/govbr/callback",
    "/callback",
    "/auth/callback",
    "/govbr/callback",
    "/login/callback",
    "/",
];

function main() {
    if (!CLIENT_ID) {
        console.error("GOVBR_CLIENT_ID ausente no .env");
        process.exit(1);
    }

    const hosts = [
        dominioDoClientId,
        "locomotiva-api-dev.inova.ma.gov.br",
        "locomotiva-admin-dev.inova.ma.gov.br",
    ].filter((h, i, a) => h && a.indexOf(h) === i);

    console.log(`\nclient_id: ${CLIENT_ID}`);
    console.log(`domínio embutido no client_id: ${dominioDoClientId}  <- candidato mais provável\n`);

    let n = 0;
    for (const host of hosts) {
        console.log(`\n═══ ${host} ═══`);
        for (const caminho of CAMINHOS) {
            const redirect = `https://${host}${caminho}`;
            const u = new URL(`${ISSUER}/authorize`);
            u.searchParams.set("response_type", "code");
            u.searchParams.set("client_id", CLIENT_ID);
            u.searchParams.set("scope", "openid email profile");
            u.searchParams.set("redirect_uri", redirect);
            u.searchParams.set("nonce", `descoberta-${n}`);
            u.searchParams.set("state", `descoberta-${n}`);
            // PKCE fixo: não vamos trocar token aqui, só descobrir a URL aceita.
            u.searchParams.set("code_challenge", "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
            u.searchParams.set("code_challenge_method", "S256");
            n++;
            console.log(`\n[${n}] ${redirect}`);
            console.log(u.toString());
        }
    }

    console.log(`\n\n${n} candidatos. Abra na ordem e me diga o número do primeiro`);
    console.log("que NÃO der invalid_grant.\n");
}

main();
