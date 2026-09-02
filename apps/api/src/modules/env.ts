import z from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string(),
    AUTH_JWT_SECRET: z.string(),
    // Sessão persistente ("continuar conectado"). O token de ACESSO (JWT) é
    // curto e nunca é revogável; quem sustenta a sessão longa é o REFRESH
    // token, guardado com hash no banco e rotacionado a cada uso — por isso o
    // logout consegue derrubar a sessão de verdade. Valores em segundos para
    // permitir testes curtos (ex.: refresh de 20 min) sem tocar em código.
    AUTH_ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900), // 15 min
    AUTH_REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(2_592_000), // 30 dias
    RESET_PASSWORD_JWT_SECRET: z.string(),
    RESET_PASSWORD_URL_BASE: z.string(),
    PORT: z.coerce.number().optional(),
    NODEMAILER_EMAIL_USER: z.string(),
    NODEMAILER_EMAIL_PASS: z.string(),
    ADMIN_URL: z.string(),
    GOOGLE_CALENDAR_ID: z.string(),
    GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string(),
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string(),

    // Storage dos arquivos .stl/.gcode (impressão 3D) — Supabase Storage via SDK.
    // As 3 são obrigatórias na prática: sem elas, o container lança erro ao gerar URLs de upload/download.
    SUPABASE_URL: z.string().optional(),
    SUPABASE_SECRET_KEY: z.string().optional(),
    STORAGE_BUCKET: z.string().optional(),

    // Login Único gov.br (OIDC). Todas OPCIONAIS de propósito: este schema é
    // `.parse()`ado no boot, então torná-las obrigatórias derrubaria a API em
    // todo ambiente que ainda não tem credencial. Quem exige é o GovbrOidcService.
    // O .trim() é essencial: espaço sobrando no id/secret gera 401 e invalid_client.
    GOVBR_ENABLED: z.enum(["true", "false"]).default("false"),
    GOVBR_CLIENT_ID: z.string().trim().optional(),
    GOVBR_CLIENT_SECRET: z.string().trim().optional(),
    GOVBR_ISSUER: z.string().trim().default("https://sso.staging.acesso.gov.br"),
    GOVBR_REDIRECT_URI: z.string().trim().optional(),
    GOVBR_SCOPES: z.string().trim().default("openid email phone profile"),
    // Para onde o gov.br devolve a pessoa após o logout federado. Precisa estar
    // cadastrada na credencial (campo "URL de Log Out"). Sem ela, usa a origem
    // da GOVBR_REDIRECT_URI.
    GOVBR_POST_LOGOUT_REDIRECT_URI: z.string().trim().optional(),
    // Controle de quanto tempo a sessão JÁ EXISTENTE no gov.br é aceita.
    // "login" força autenticação a cada acesso, ignorando a sessão deles —
    // é o que faz o sistema pedir senha de novo depois de sair.
    GOVBR_PROMPT: z.enum(["none", "login", "consent", "select_account"]).optional(),
    // Alternativa mais branda: aceita a sessão só se a pessoa autenticou há
    // menos de N segundos. Ex.: 900 = 15 minutos.
    GOVBR_MAX_AGE: z.coerce.number().int().nonnegative().optional(),
})

export const env = envSchema.parse(process.env);

