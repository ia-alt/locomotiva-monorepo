/**
 * Verifica o handshake completo com o Login Único gov.br sem depender de
 * nenhuma rota da aplicação.
 *
 * Funciona em DOIS COMANDOS, para que o `code_verifier` do PKCE sobreviva
 * enquanto você captura a URL de retorno no navegador:
 *
 *   1) npx tsx scripts/govbr-handshake.ts
 *      imprime o link do gov.br e salva state/nonce/code_verifier num arquivo
 *      temporário. Pode fechar o terminal.
 *
 *   2) npx tsx scripts/govbr-handshake.ts --retorno "<URL com ?code=>"
 *      troca o código por token, valida e mostra a identidade.
 *
 * Para capturar a URL de retorno: abra o DevTools (F12) na aba Network, marque
 * "Preserve log", digite `callback` no filtro, e depois de autorizar copie o
 * endereço da linha que sobrar.
 */
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { env } from "../src/modules/env";
import { OpenIdGovbrOidcService } from "../src/modules/identity/infra/services/openid-govbr-oidc";

const ARQUIVO_ESTADO = join(tmpdir(), "govbr-handshake-estado.json");

type EstadoPendente = {
    state: string;
    nonce: string;
    codeVerifier: string;
    redirectUri: string;
    criadoEm: string;
};

async function main() {
    const args = process.argv.slice(2);
    const i = args.indexOf("--retorno");
    const urlRetorno = i >= 0 ? args[i + 1]?.trim() : undefined;

    if (i >= 0 && !urlRetorno) {
        console.error("\n✗ Use: --retorno \"<URL completa com ?code=>\"\n");
        process.exit(1);
    }

    if (urlRetorno) await trocar(urlRetorno, args.includes("--cru"));
    else await gerar(args);
}

// ───────────────────────── etapa 1: gerar o link ─────────────────────────

async function gerar(args: string[]) {
    // Permite testar uma redirect_uri candidata sem editar o .env.
    const override = args.find(a => a.startsWith("http"));
    if (override) {
        (env as { GOVBR_REDIRECT_URI?: string }).GOVBR_REDIRECT_URI = override;
        console.log(`\n(usando redirect_uri do argumento: ${override})`);
    }

    const faltando = (["GOVBR_CLIENT_ID", "GOVBR_CLIENT_SECRET", "GOVBR_REDIRECT_URI"] as const)
        .filter(nome => !env[nome]);

    if (faltando.length > 0) {
        console.error(`\n✗ Faltam variáveis no .env: ${faltando.join(", ")}\n`);
        process.exit(1);
    }

    const issuer = env.GOVBR_ISSUER.replace(/\/+$/, "");
    console.log("\n── Configuração ──");
    console.log(`issuer        ${issuer}`);
    console.log(`client_id     ${env.GOVBR_CLIENT_ID}`);
    console.log(`redirect_uri  ${env.GOVBR_REDIRECT_URI}`);
    console.log(`scopes        ${env.GOVBR_SCOPES}`);

    const service = new OpenIdGovbrOidcService();
    const { codeVerifier, codeChallenge } = service.createPkcePair();
    const state = randomBytes(16).toString("base64url");
    const nonce = randomBytes(16).toString("base64url");

    salvarEstado({
        state,
        nonce,
        codeVerifier,
        redirectUri: env.GOVBR_REDIRECT_URI!,
        criadoEm: new Date().toISOString(),
    });

    console.log("\n═══════════ PASSO 1 — abra esta URL no navegador ═══════════\n");
    console.log(service.buildAuthorizationUrl({ state, nonce, codeChallenge }));

    console.log("\n═══════════ PASSO 2 — capture a URL de retorno ═══════════");
    console.log("Antes de colar o link acima, abra o DevTools (F12) > aba Network,");
    console.log('marque "Preserve log" e digite  callback  na caixa de filtro.');
    console.log("");
    console.log("Depois de autorizar, o app vai te jogar na tela inicial e apagar");
    console.log("a URL da barra de endereço — por isso a captura é pelo Network.");
    console.log("Botão direito na linha que sobrou > Copy > Copy link address.");

    console.log("\n═══════════ PASSO 3 — troque o código ═══════════");
    console.log("npx tsx scripts/govbr-handshake.ts --retorno \"<cole a URL aqui>\"");
    console.log("\nO código expira em segundos, então rode o passo 3 logo em seguida.");
    console.log("Se expirar, é só repetir do passo 1.\n");
}

// ──────────────────────── etapa 2: trocar o código ────────────────────────

async function trocar(urlRetorno: string, cru: boolean) {
    const estado = lerEstado();
    if (!estado) {
        console.error("\n✗ Não achei o estado da rodada anterior.");
        console.error("  Rode primeiro: npx tsx scripts/govbr-handshake.ts\n");
        process.exit(1);
    }

    let retorno: URL;
    try {
        retorno = new URL(urlRetorno);
    } catch {
        console.error("\n✗ Não é uma URL válida. Cole a URL INTEIRA, entre aspas.\n");
        process.exit(1);
    }

    const erro = retorno.searchParams.get("error");
    if (erro) {
        console.error(`\n✗ O gov.br recusou: ${erro} — ${retorno.searchParams.get("error_description") ?? ""}\n`);
        process.exit(1);
    }

    const code = retorno.searchParams.get("code");
    if (!code) {
        console.error("\n✗ Essa URL não tem `code`. Você copiou a URL de IDA (a do sso.staging).");
        console.error("  Precisa ser a de VOLTA, a que contém /auth/govbr/callback?code=...\n");
        process.exit(1);
    }

    // É esta comparação que impede CSRF no fluxo real.
    if (retorno.searchParams.get("state") !== estado.state) {
        console.error("\n✗ `state` divergente — essa URL é de outra rodada.");
        console.error("  Rode o passo 1 de novo e capture o retorno dessa nova rodada.\n");
        process.exit(1);
    }
    console.log("\n✓ state confere");

    (env as { GOVBR_REDIRECT_URI?: string }).GOVBR_REDIRECT_URI = estado.redirectUri;
    const service = new OpenIdGovbrOidcService();

    const identity = await service.exchangeCodeForIdentity({
        code,
        codeVerifier: estado.codeVerifier,
        expectedNonce: estado.nonce,
    });

    limparEstado();
    console.log("✓ id_token validado (assinatura RS256 via JWKS, iss, aud, exp, nonce)");

    // Se a conta de teste for real, esta saída carrega dados de uma pessoa.
    // Mascarado por padrão; `--cru` mostra tudo.
    console.log("\n── Identidade recebida ──");
    console.log(JSON.stringify({
        sub: cru ? identity.sub : mascarar(identity.sub),
        cpf: cru ? identity.cpf : mascarar(identity.cpf),
        name: cru ? identity.name : mascararNome(identity.name),
        socialName: identity.socialName === null ? null : (cru ? identity.socialName : mascararNome(identity.socialName)),
        email: identity.email === null ? null : (cru ? identity.email : mascararEmail(identity.email)),
        phone: identity.phone === null ? null : (cru ? identity.phone : mascarar(identity.phone)),
        picture: identity.picture === null ? null : "(presente)",
    }, null, 2));

    // O que interessa para a implementação é o FORMATO, não o valor.
    console.log("\n── O que isso nos diz (sem expor dado pessoal) ──");
    const naoDigitos = identity.sub.replace(/[a-zA-Z0-9]/g, "");
    console.log(`sub: ${identity.sub.length} chars | só dígitos? ${/^\d+$/.test(identity.sub) ? "SIM" : `NÃO (contém "${naoDigitos}")`}`);
    console.log(`sub === cpf derivado? ${identity.sub === identity.cpf ? "SIM (sub é o CPF puro)" : "NÃO (formatado ou pseudônimo pairwise)"}`);
    console.log(`e-mail verificado?    ${identity.email ? "SIM" : "não veio"}`);
    console.log(`telefone verificado?  ${identity.phone ? "SIM" : "não veio"}`);
    console.log(`nome social?          ${identity.socialName ? "SIM" : "não veio"}`);
    console.log(`foto?                 ${identity.picture ? "SIM" : "não veio"}`);
    console.log("\nSem data de nascimento — é o que obriga a etapa de completar cadastro.");
    console.log("\nPode colar este bloco com segurança.\n");
}

// ────────────────────────────── auxiliares ──────────────────────────────

function salvarEstado(e: EstadoPendente) {
    writeFileSync(ARQUIVO_ESTADO, JSON.stringify(e), { mode: 0o600 });
}

function lerEstado(): EstadoPendente | null {
    if (!existsSync(ARQUIVO_ESTADO)) return null;
    try { return JSON.parse(readFileSync(ARQUIVO_ESTADO, "utf-8")) as EstadoPendente; }
    catch { return null; }
}

function limparEstado() {
    try { unlinkSync(ARQUIVO_ESTADO); } catch { /* já não existe */ }
}

function mascarar(v: string): string {
    if (v.length <= 4) return "*".repeat(v.length);
    return v.slice(0, 2) + "*".repeat(v.length - 4) + v.slice(-2);
}

function mascararNome(v: string): string {
    return v.split(/\s+/).map(p => p.length <= 2 ? p : p[0] + "*".repeat(p.length - 1)).join(" ");
}

function mascararEmail(v: string): string {
    const [local, dominio] = v.split("@");
    if (!dominio) return mascarar(v);
    return `${local[0]}${"*".repeat(Math.max(1, local.length - 1))}@${dominio}`;
}

main().catch(err => {
    console.error(`\n✗ ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
});
