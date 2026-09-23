# Login Único gov.br — Análise e Plano de Integração

**Projeto:** monorepo Locomotiva (`apps/api`, `apps/admin`, `apps/mobile`, `apps/tablet`)
**Data:** 2026-08-05
**Status:** plano aprovado para implementação em homologação; produção depende de bloqueadores externos (seção 9)

---

## 1. Resposta direta

**Sim, dá para fazer no sistema atual.** Mas não é "plugar uma lib". São três frentes distintas, e a maior parte do esforço **não está no OIDC** — está em desacoplar o modelo de usuário, que hoje é rigidamente amarrado a senha local + CPF + data de nascimento.

### O que é tranquilo

- **O transporte HTTP não é bloqueante.** O servidor é `node:http` cru (`apps/api/src/modules/_core/presentation/orpc-server/server.ts:39`) e já tem dois precedentes de rota crua que escrevem direto no `res`: `/spec.json` (linha 51) e `/docs` (linha 77). Um `res.writeHead(302, {Location})` funciona. Ressalva: as rotas existentes comparam `req.url === '...'` por igualdade exata, e `req.url` inclui a querystring — é obrigatório usar `new URL(req.url, base).pathname`.
- **Sessão própria já existe e está correta.** O projeto já emite JWT próprio (`infra/services/jwt-auth-token.ts`), que é exatamente o que o roteiro do gov.br exige ("a aplicação cliente deve ter sessão com mecanismo próprio"). Basta terminar o fluxo federado chamando `generateToken(user)`.
- **Zero impacto de integridade referencial no banco.** Existe **uma única** FK apontando para `users` em todo o schema: `File.uploadedByUser` (`prisma/schema.prisma:182`). `Booking.userId` (69), `AccessLog.userId` (108) e `PrintRequest.userId` (152) são colunas `String` soltas, sem `@relation`. Afrouxar `passwordHash` e adicionar `govbrSub`/`authProvider` é 100% mudança de código TypeScript, não de integridade de dados.
- **Padrões arquiteturais claros para seguir.** O módulo `identity` tem 4 camadas bem definidas, o container DI tem padrão de lazy-singleton estabelecido, e já existe precedente de segundo mecanismo de autenticação plugado (`systemAuthMiddleware` com `x-api-key`).

### O que dá trabalho

- **O modelo de usuário é o bloqueio real.** `passwordHash` (schema.prisma:23), `birthDate` (22), `cpf` (21) e `email` (20) são NOT NULL. `passwordHash` e `birthDate` são argumentos posicionais obrigatórios do construtor de `User` (`domain/entities/user.ts:19` e `:17`). `phone: string` é obrigatório em `User.CreateParams` (166) e `AuthService.RegisterParams` (auth.ts:73), apesar de nullable no banco. E `prisma-user.ts:113` revalida `BirthDate.fromDate()` (que exige idade ≥ 16) **a cada leitura** — uma linha provisionada sem data válida faz `findById`/`findAll` explodir em runtime, para todos os usuários, não só o federado.
- **O admin não aceita usuário comum.** `ProtectedRoute.tsx:30` e `useLogin.ts:47-51` expulsam qualquer conta com `userType !== 'admin'`, e `User.create` fixa `User.UserType.USER` (`entities/user.ts:52`). Um usuário federado **nunca** entra pelo admin sem promoção manual. Isso afeta diretamente a escolha do cliente onde gravar o vídeo de homologação.
- **Endurecimento de segurança obrigatório.** Duas vulnerabilidades sérias já existem no código e são *agravadas* pela federação: (a) o reset de senha por código de 6 dígitos por CPF (`domain/services/password.ts:66-105`) usa `Math.random` (`user.ts:116`), não tem rate limit nem contador de tentativas, e permitiria definir senha local numa conta federada; (b) qualquer um registra hoje uma conta local com CPF de terceiro, porque `/auth/register` é rota pública e `Cpf.fromString` só valida dígito verificador. Sem tratar isso, a integração gov.br **enfraquece** a postura de segurança em vez de melhorá-la.
- **Nada de JWKS/RS256 existe.** `apps/api/package.json` só tem `jsonwebtoken@9`, que exige chave em PEM enquanto o `/jwk` devolve JWK. Precisa de `jose`.
- **Não há onde guardar `state`/`nonce`/`code_verifier`.** Grep por `cookie|session|csrf` em `apps/api/src` retorna zero ocorrências fora do Prisma gerado.

### O que é bloqueador externo

- **Domínio oficial de governo para produção** — **status: a confirmar, provavelmente já resolvido.** O plano inicial tratava isso como bloqueador definitivo, mas os workflows apontam para `https://coolify-vps.inova.ma.gov.br/api/v1/deploy` e o e-mail do time é `@secti2.ma.gov.br`. A infra já está sob `ma.gov.br`. **Ação:** levantar em que domínio público a API e o admin respondem hoje. Se já for `*.ma.gov.br`, o bloqueador some.
- **Cadastro da `redirect_uri` e da "URL de Log Out" na credencial** — erro `invalid_grant` se a URL usada não bater com a cadastrada.
- **Vídeo de homologação aprovado pela SGD** antes da credencial de produção.
- **Liberação de IP no firewall do gov.br** para produção (o IP de egress do backend precisa ser fixo e informado).

### Estimativa

| Frente | Dias |
|---|---|
| Backend OIDC (serviço, use cases, rota crua, JWKS) | 3–4 |
| Modelo de dados + migração + provisionamento | 2–3 |
| Clientes (admin + mobile-web) | 2–3 |
| Endurecimento de segurança (vinculação com prova de posse, binding cliente↔fluxo, invalidação de sessão, rate limit/CSPRNG) | 2 |
| Testes automatizados | 1,5 |
| Setup de túnel/ambiente de dev | 0,5 |
| **Total realista** | **12 a 18 dias** |

> **Nota sobre a estimativa:** a faixa "8–13 dias" de um rascunho anterior não incluía o endurecimento de segurança nem o setup de ambiente. A alternativa "sem endurecimento" entrega um login federado que abre porta lateral — não é uma opção defensável.

### Correção importante sobre escopo do mobile

**Não existe `eas.json` em lugar nenhum do monorepo.** O script de build é `expo export --platform web` (`apps/mobile/package.json:12`) e o deploy é no Coolify. **O artefato mobile que roda em produção hoje é uma SPA web, não um app nativo.** Portanto:

- Todo o trabalho de `scheme`, `bundleIdentifier`, `android.package`, `expo-web-browser` e deep link só vale **quando houver build nativo** — que ainda não existe.
- A proibição de WebView do gov.br e o risco de reprovação por WebView são **hipotéticos no estado atual**.
- Para a entrega atual, o mobile é apenas mais uma SPA: redirect de página inteira, mesmo tratamento do admin.

**O tablet está fora de escopo**, e o motivo é explícito: `apps/tablet` autentica o **dispositivo** por `x-api-key` (`apps/tablet/src/locomotiva-api/link.ts:10`) e identifica a pessoa por CPF + data de nascimento — não há login de usuário. Consequência de segurança a registrar: se um dia o totem passar a identificar pessoas, a API key compartilhada no `AsyncStorage` do dispositivo **não pode** virar caminho de emissão de sessão federada.

---

## 2. Como o Login Único funciona (o fluxo, na prática)

### Legenda de confiança

- ✅ **CONFIRMADO** — verbatim no roteiro técnico oficial (`acesso.gov.br/roteiro-tecnico` / repositório `servicosgovbr/manual-roteiro-integracao-login-unico`) ou nos discovery documents ao vivo.
- ⚠️ **INFERIDO** — derivado de fonte secundária ou de probe HTTP; **não é documentação oficial**.
- ❓ **A CONFIRMAR PELO DEV** — precisa de teste com a credencial de homologação ou de chamado à SGD.

### Diagrama do fluxo

```
┌─────────┐         ┌──────────────┐         ┌─────────────────┐
│ Cliente │         │  API         │         │   gov.br SSO    │
│ (SPA)   │         │  Locomotiva  │         │   (staging)     │
└────┬────┘         └──────┬───────┘         └────────┬────────┘
     │                     │                          │
     │ 1. clique "Entrar com gov.br"                  │
     │    + segredo CSPRNG gerado no cliente          │
     │──────────────────►  │                          │
     │  POST /api/identy/startGovbrLogin              │
     │  { client: "admin", clientSecretHash }         │
     │                     │                          │
     │                     │ 2. gera state, nonce,    │
     │                     │    code_verifier;        │
     │                     │    grava em              │
     │                     │    govbr_auth_requests   │
     │                     │                          │
     │ ◄──────────────────│                          │
     │  { authorizationUrl }                          │
     │                     │                          │
     │ 3. window.location.href = authorizationUrl     │
     │────────────────────────────────────────────────►
     │    GET /authorize?response_type=code           │
     │      &client_id=...&scope=...                  │
     │      &redirect_uri=<URL-ENCODED>               │
     │      &nonce=...&state=...                      │
     │      &code_challenge=...                       │
     │      &code_challenge_method=S256               │
     │                     │                          │
     │              [ usuário autentica e consente ]  │
     │                     │                          │
     │                     │ 4. 302 para redirect_uri │
     │                     │ ◄────────────────────────│
     │                     │  GET /auth/govbr/callback│
     │                     │      ?code=...&state=... │
     │                     │                          │
     │                     │ 5. valida state          │
     │                     │    (existe, não expirou, │
     │                     │     não consumido)       │
     │                     │                          │
     │                     │ 6. POST /token           │
     │                     │────────────────────────► │
     │                     │  Authorization: Basic    │
     │                     │    b64(id:secret)        │
     │                     │  grant_type=             │
     │                     │    authorization_code    │
     │                     │  code, redirect_uri,     │
     │                     │  code_verifier           │
     │                     │                          │
     │                     │ ◄────────────────────────│
     │                     │  { access_token,         │
     │                     │    token_type: "Bearer", │
     │                     │    expires_in: 3599,     │
     │                     │    scope, id_token }     │
     │                     │                          │
     │                     │ 7. GET /jwk              │
     │                     │────────────────────────► │
     │                     │ ◄──── { keys: [...] }    │
     │                     │                          │
     │                     │ 8. verifica id_token:    │
     │                     │    assinatura RS256/512, │
     │                     │    iss, aud, exp, iat,   │
     │                     │    nonce                 │
     │                     │                          │
     │                     │ 9. resolve/provisiona    │
     │                     │    usuário; emite JWT    │
     │                     │    próprio; gera         │
     │                     │    one-time code         │
     │                     │                          │
     │ ◄──────────────────│                          │
     │  302 Location:                                 │
     │  <clientUrl>/auth/callback?c=<one-time-code>    │
     │                     │                          │
     │ 10. POST /api/identy/exchangeGovbrCode         │
     │     { code, clientSecret }                     │
     │──────────────────►  │                          │
     │ ◄──────────────────│                          │
     │  { token }  ← JWT próprio                      │
     │                     │                          │
     │ 11. localStorage.setItem('token'); getMe()     │
     │                     │                          │
     │                     │                          │
     │  ─── LOGOUT (obrigatório) ───                  │
     │ 12. window.location.href =                     │
     │     /logout?post_logout_redirect_uri=<URL>     │
     │────────────────────────────────────────────────►
```

### Endpoints de homologação (staging)

Todos ✅ **CONFIRMADOS** no roteiro e nos discovery documents.

| Função | URL |
|---|---|
| Discovery | `https://sso.staging.acesso.gov.br/.well-known/openid-configuration` |
| Authorize | `https://sso.staging.acesso.gov.br/authorize` |
| Token | `https://sso.staging.acesso.gov.br/token` |
| JWKS | `https://sso.staging.acesso.gov.br/jwk` *(note: `/jwk`, não `/jwks`)* |
| UserInfo | `https://sso.staging.acesso.gov.br/userinfo` *(o discovery declara **sem** barra final; o roteiro escreve **com** barra — usar a do discovery e tolerar redirect)* |
| Logout | `https://sso.staging.acesso.gov.br/logout` |
| Issuer (claim `iss`) | `https://sso.staging.acesso.gov.br/` — **com barra final** |

⚠️ **INFERIDO — URLs de produção.** O roteiro técnico documenta **exclusivamente** URLs de staging. A única URL de produção que aparece na doc é `https://sso.acesso.gov.br/token`, e por acidente, dentro de uma mensagem de erro na página de Erros Comuns. A regra de derivação (remover o segmento `.staging`) foi confirmada por consulta ao discovery de produção e por probes HTTP, mas **não é documentação oficial**. Manter o issuer em `GOVBR_ISSUER` (env), nunca hardcodar, e confirmar contra o documento de credencial de produção quando ele chegar.

### Detalhes por passo

**Passo 3 — `/authorize`** ✅

Parâmetros obrigatórios (todos confirmados verbatim):

| Parâmetro | Valor / regra |
|---|---|
| `response_type` | `code` |
| `client_id` | fornecido na credencial |
| `scope` | separados por `+` na querystring |
| `redirect_uri` | **URL-encoded**; "não pode conter caracteres especiais" (RFC 6749 §3.1.2) |
| `nonce` | obrigatório; "valor aleatório, mas que não seja de fácil dedução" |
| `state` | obrigatório; "deve ser validado no cliente (validado que foi previamente emitido pelo cliente)" |
| `code_challenge` | `BASE64URL(SHA256(ASCII(code_verifier)))` |
| `code_challenge_method` | `S256` |

⚠️ **Armadilha confirmada:** o discovery **não anuncia** `code_challenge_methods_supported` em nenhum dos dois ambientes, embora o roteiro exija PKCE. Bibliotecas OIDC que fazem discovery automático **desligam PKCE** por causa disso. Se usar `openid-client`, é obrigatório forçar PKCE na configuração.

**Passo 6 — `/token`** ✅

- Header `Authorization: Basic base64(CLIENT_ID:CLIENT_SECRET)` — a palavra `Basic` antes do valor.
- Header `Content-Type: application/x-www-form-urlencoded`.
- Body: `grant_type=authorization_code`, `code`, `redirect_uri` (URL-encoded), `code_verifier`.
- `code_verifier`: **mínimo 43, máximo 128 caracteres**.

⚠️ **Método alternativo:** os dois discovery declaram `token_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic"]`. Usar `client_secret_basic` (que é o prescrito no roteiro e o que será avaliado), mas saber que `client_secret_post` existe e serve de fallback de diagnóstico quando o Basic falha.

**Passo 7 — validação do `id_token`** ✅ com armadilha crítica

⚠️ **CRÍTICO:** staging e produção usam o **MESMO `kid`** (`"rsa1"`) com **modulus RSA diferentes** (staging começa `"yKqGRQ..."`, produção `"zoc7Ob..."`). Um cache de JWKS indexado só por `kid`, compartilhado entre ambientes, **falha silenciosamente ou valida com a chave errada**. Chavear sempre por `(issuer, kid)`.

Algoritmos suportados: `RS256`, `RS512`.

**Passo 12 — logout** ✅

- `GET` ou `POST` em `https://sso.staging.acesso.gov.br/logout?post_logout_redirect_uri=<URL>`.
- "**Implementação obrigatória** a fim de encerrar a sessão do usuário com o Login Único."
- "O acesso ao Log Out deverá ser pelo **Front End** da aplicação."
- A URL de retorno deve estar previamente cadastrada no campo **"URL de Log Out"** da credencial.
- ⚠️ O discovery **não anuncia** `end_session_endpoint`, mas o endpoint existe e responde 302 — mais um caso onde o metadata do gov.br é incompleto.

### O que NÃO existe

| Recurso | Status |
|---|---|
| `refresh_token` | ✅ **Confirmado ausente.** `grant_types_supported: ["authorization_code", "client_credentials"]`. Renovação = novo `/authorize`. |
| `revocation_endpoint` | ✅ **Confirmado ausente** nos dois discovery. Não há como revogar o `access_token` do gov.br server-side. Reforça a decisão de descartar os tokens do IdP logo após validar. |
| `introspection_endpoint` | ✅ Confirmado ausente. |
| `acr_values` (exigir 2FA no authorize) | ⚠️ **Inferido ausente.** `acr_values_supported` não aparece nos discovery e `acr_values` não é mencionado no roteiro. Assumir que não dá para exigir nível no `/authorize` — só verificar depois, via claim `amr`. ❓ Confirmar com a SGD antes de projetar em cima disso. |

---

## 3. O que o gov.br entrega vs. o que o nosso cadastro exige

### Fonte de verdade da identidade

**A identidade vem exclusivamente do `id_token` verificado.** Se `/userinfo` for chamado, é obrigatório exigir `userinfo.sub === idToken.sub` e descartar a resposta se divergir. **Nunca** usar `/userinfo` como fonte de autenticação.

### Tabela de correspondência

| Campo do `User` | Schema | Vem do gov.br? | O que fazer |
|---|---|---|---|
| `name` | `String` NOT NULL | ✅ **Sim** — claim `name` (escopo `profile`). Também há `social_name` (opcional, "aparecerá apenas se existir no cadastro"). | Usar `social_name` para exibição quando existir; `name` para o campo. Nenhuma mudança de schema. |
| `email` | `String @unique` NOT NULL | ⚠️ **Condicional** — claim `email` (escopo `email`). ✅ Confirmado: "Caso `email_verified` tiver o valor false, o atributo `email` **não virá**". | **Manter NOT NULL.** Se ausente → erro de domínio explicativo, não gerar e-mail sintético. Se presente mas já pertence a **outro** usuário → `GovbrEmailConflictError` (409), nunca 500 por P2002. **Nunca** usar e-mail como chave de resolução nem sobrescrever e-mail local a partir das claims. |
| `cpf` | `String @unique` NOT NULL | ⚠️ **Sim, mas com ressalva** — ver bloco abaixo. | Normalizar com `Cpf.fromString` (que já faz `replace(/\D/g,'')`). Ver política de vinculação na seção 6. |
| `birthDate` | `DateTime` NOT NULL | ❌ **NÃO** | **Manter NOT NULL** + etapa "complete seu cadastro". Ver decisão abaixo. |
| `phone` | `String?` (nullable no banco) | ⚠️ **Condicional** — escopo `phone`, que **não está** no scope padrão sugerido. "Caso `phone_number_verified` tiver o valor false, `phone_number` não virá". | Nullable no banco, mas **obrigatório no domínio** (`CreateParams:166`, `RegisterParams:73`, `UpdateSchema:182`). Coletar no "complete seu cadastro". |
| `company` | `String?` | ❌ Não | Coletar opcionalmente no perfil. Sem mudança. |
| `jobTitle` | `String?` | ❌ Não | Idem. |
| `passwordHash` | `String` NOT NULL | ❌ **Não se aplica** — o IdP é a fonte de autenticação | **Tornar nullable** + guards. Ver seção 4 e 6. |
| `userType` | `String` NOT NULL | ❌ Não | ⚠️ **`User.create` fixa `User.UserType.USER`** (`entities/user.ts:52`) — está correto e **deve permanecer**. Nenhum campo das claims pode chegar perto de `userType`. **Consequência:** usuário federado não entra no admin (`ProtectedRoute.tsx:30`). Ver seção 5, Etapa 6. |

### ⚠️ Correção importante sobre o `sub`

Um rascunho anterior afirmava que "o `sub` é o CPF, 11 dígitos, sem pontuação, já validado pelo gov.br". **A garantia de formato é falsa e a documentação se contradiz:**

- No exemplo oficial do **ID_TOKEN**: `"sub": "123456789-00"` — **com hífen**.
- No exemplo oficial do **ACCESS_TOKEN**: `"sub": "12345678900"` — sem pontuação.
- O claim `cnpj` no mesmo exemplo vem formatado (`"12.345.678/0001-00"`), o que mostra que o provedor não tem disciplina de normalização.

**Além disso:** `subject_types_supported` nos dois discovery é `["public", "pairwise"]`. ❓ **Se a credencial for provisionada como `pairwise`, o `sub` deixa de ser o CPF** e vira um pseudônimo por client — o que invalida toda a estratégia de vínculo. **Ação obrigatória:** confirmar com a SGD, no chamado da credencial, qual `subject_type` está configurado.

**Decisão prática:**
- Guardar em `govbrSub` o valor **bruto** do `sub`, tratado como string opaca.
- Derivar o CPF do claim **`preferred_username`**, que o roteiro documenta como "CPF do usuário autenticado" e aparece **sem pontuação nos dois exemplos oficiais**. Este claim é ignorado por completo no plano original e é a fonte mais confiável.

### ⚠️ Correção sobre a prova de que `birthDate` não vem

Um rascunho anterior justificou a ausência de data de nascimento com "`claims_supported` do discovery não tem `birthdate`". **Essa prova é inválida.** O `claims_supported` do gov.br é `["sub","name","preferred_username","profile","picture","email","email_verified","phone_number","phone_number_verified"]` — ele **omite** claims que o próprio roteiro documenta como retornadas no `id_token`: `social_name`, `amr`, `reliability_info`, `nonce`, `auth_time`, `scope`, `jti`, `cnpj`, `cnpj_certificate_name`. **Ausência no `claims_supported` do gov.br é evidência fraquíssima.**

**A evidência boa é dupla e independente:**
1. A página *Escopos de Atributos* lista os atributos por escopo — `openid, email, phone, profile` devolve literalmente "CPF, Nome, e-mail, telefone, foto". Sem data de nascimento.
2. O exemplo oficial de resposta do `/userinfo` (Passo 9) traz apenas `sub`, `name`, `social_name`, `profile`, `picture`, `email`, `email_verified`, `phone_number`, `phone_number_verified`.

❓ **Confirmação definitiva pelo dev:** fazer um login real com a credencial de homologação **antes** de orçar a tela de "complete seu cadastro", e inspecionar o `id_token` e o `/userinfo`.

**Regra geral a adotar:** parar de usar `claims_supported`/`scopes_supported` do gov.br como prova de ausência em qualquer ponto da análise.

### Decisão: `birthDate` — completar perfil, não tornar nullable

**Recomendação: manter `birthDate` NOT NULL e exigir etapa de "complete seu cadastro" no primeiro login federado.**

Motivo: tornar nullable tem blast radius grande e perigoso. `prisma-user.ts:113` chama `BirthDate.fromDate(user.birthDate)` em **toda** leitura (`findById`, `findAll`, `findByEmailOrCpf`, `findManyByIds`), sem null-check, e `BirthDate` lança `new Error()` genérico (`birth-date.ts:8`) em vez do `InvalidBirthDateError` que existe em `domain/errors/index.ts:35-43` e **nunca é usado** — sintoma seria HTTP 500 sem mensagem útil.

⚠️ **Correção à lista de pontos acoplados:** um rascunho anterior listou 6 pontos. **São 8.** Faltavam dois métodos que reatribuem `birthDate` incondicionalmente:

1. Construtor (`user.ts:17`)
2. `toJSON` (`user.ts:136`)
3. `User.JsonSchema` (`user.ts:190` — não 189; 189 é `cpf`)
4. `User.UpdateSchema` (`user.ts:174-183` — que exige `phone: z.string()` não-nullable, inconsistente com `phone String?` no banco)
5. `save` — ramo `create` (`prisma-user.ts:46`)
6. `save` — ramo `update` (`prisma-user.ts:31`)
7. **`User.update`** (`user.ts:68-77`) — `this.birthDate = BirthDate.fromJSON(data.birthDate)`
8. **`User.updateSelf`** (`user.ts:79-86`) — assinatura exige `birthDate: BirthDate` e `phone: string` obrigatórios; é por aqui que passa o fluxo `updateMe`

### Tipagem dos claims — armadilha não óbvia

⚠️ No exemplo oficial do **ID_TOKEN**, `email_verified` e `phone_number_verified` vêm como **STRING** (`"true"`). No exemplo do **`/userinfo`**, vêm como **BOOLEAN** (`true`).

Qualquer schema zod do `id_token` precisa aceitar `z.union([z.boolean(), z.enum(['true','false'])])` e coagir — senão o login quebra na **validação**, não na assinatura, e o sintoma vira erro genérico difícil de diagnosticar.

Da mesma forma: **só persistir `email`/`phone` quando `email_verified`/`phone_number_verified` forem `true`**; caso contrário, tratar como ausente.

### Autenticação por certificado digital de PJ

⚠️ Quando a autenticação ocorre por certificado digital de pessoa jurídica, `access_token` e `id_token` ganham os claims `cnpj` e `cnpj_certificate_name`, e o CNPJ vem **formatado** (`"12.345.678/0001-00"`).

**Decisão necessária:** o Locomotiva aceita contas PJ? Se não, rejeitar com erro de domínio dedicado **antes** de chegar em `Cpf.fromString` (que lançaria `InvalidCpfError` genérico).

### `reliability_info.level` vem em inglês

⚠️ O exemplo oficial traz `"level": "gold"`, e as observações confirmam `gold | silver | bronze`. O texto corrido do roteiro fala em "bronze/prata/ouro", mas **esse não é o valor serializado**. Qualquer enum ou comparação escrita em português falha silenciosamente.

Mapeamento: `bronze` = id `"1"`, `silver` = id `"2"`, `gold` = id `"3"`. E o campo de data muda de nome entre fontes: `updatedAt` (no `id_token`) vs `dataAtualizacao` (na API REST).

---

## 4. O que precisa mudar no código

Organizado por camada, seguindo a arquitetura existente do módulo `identity`.

### 4.0 Pré-requisito de higiene (fazer ANTES de qualquer coisa)

| Arquivo | O que fazer | Por quê |
|---|---|---|
| `apps/api/.env.exemple` | **Remover a connection string real da linha 12** (`postgresql://8c670454...:sk_Q2cqOnO7OHQclfyFBIy9e@db.prisma.io:5432/postgres`) e substituir por placeholder. **Rotacionar a credencial.** | Segredo de produção versionado no repositório. Agrava diretamente o risco de wipe de base (item abaixo). |
| `apps/api/tests/helpers/index.ts` | Fazer o `cleanDatabase` (linha 13, `prisma.user.deleteMany()`) abortar se `DATABASE_URL` não apontar para um banco de teste dedicado. Corrigir a referência a `User.UserType.SYSTEM` (linha 19), que não existe mais. | Os testes apagam `users` usando o mesmo `DATABASE_URL` do `.env`. Rodar a suíte para validar o login federado pode **apagar a base real**. |
| `apps/api/src/modules/_core/presentation/orpc-server/server.ts:127` | Reduzir o `console.log(req.url, rpcResult)` para logar apenas método + pathname, **nunca** a querystring. | Hoje qualquer parâmetro sensível em GET vai para o log da aplicação. Amanhã capturaria o one-time code. |
| `apps/api/package.json` | Adicionar `"engines": { "node": ">=20" }` e/ou `.nvmrc`. | Não há Dockerfile nem declaração de versão no repo; `fetch` global existe a partir do Node 18, e depender disso sem fixar é frágil. |
| — | `git status` mostra `prisma/migrations/20260805175006_filament_active/` **untracked**, mais `schema.prisma` e client Prisma modificados. **Commitar/mergear antes** de criar a migração do gov.br. | A migração nova empilharia sobre base suja. |
| — | Rodar `npx prisma migrate status` contra produção. | Há forte indício de **drift**: `20260323194539_make_cpf_nullable` faz `DROP NOT NULL` em `users.cpf`, e **duas** migrações consecutivas (`20260325190509_remove_system:8` e `20260330205638_checkin:11`) reexecutam o mesmo `SET NOT NULL`. Além disso a pasta `20260320181008_add_booking_description` foi apagada e substituída no commit `52f73f5`. |

### 4.1 Banco de dados

**Arquivo:** `apps/api/prisma/schema.prisma`

```prisma
model User {
  // ... campos existentes ...
  passwordHash          String?   // ← era String (NOT NULL)
  govbrSub              String?   @unique   // ← novo
  authProvider          String    @default("local")  // ← novo: "local" | "govbr"
  profileCompletedAt    DateTime? // ← novo
  sessionsValidFrom     DateTime? // ← novo (invalidação de sessão)
  // ...
}

model GovbrAuthRequest {
  id                String    @id
  state             String    @unique
  nonce             String
  codeVerifier      String
  clientSecretHash  String    // SHA-256 do segredo gerado pelo cliente (binding)
  client            String    // enum fechado: "admin" | "mobile-web" | "mobile-app"
  expiresAt         DateTime
  consumedAt        DateTime?
  createdAt         DateTime  @default(now())

  @@map("govbr_auth_requests")
}

model GovbrSessionHandoff {
  id                String    @id
  code              String    @unique   // one-time code opaco
  clientSecretHash  String
  authToken         String              // JWT próprio já emitido
  expiresAt         DateTime
  consumedAt        DateTime?
  createdAt         DateTime  @default(now())

  @@map("govbr_session_handoffs")
}
```

> `authProvider` como `String` + `z.enum` no domínio, **não** `enum` do Prisma — segue a convenção de `userType` (`schema.prisma:27`) e de todos os status do projeto.

**Migração:** `apps/api/prisma/migrations/<YYYYMMDD>000000_govbr_login/migration.sql`

Seguir o padrão de migração manual do repo (timestamp terminando em `000000`, comentário em PT-BR no topo, como em `20260710120000_file_uploaded_by_user`):

```sql
-- Suporte a login federado gov.br (Login Unico).
-- passwordHash vira nullable porque usuarios autenticados pelo gov.br
-- nao possuem credencial local; o IdP e a fonte de autenticacao.
-- govbrSub e a chave de vinculo com a identidade federada.
-- authProvider default 'local' classifica corretamente toda a base legada,
-- sem necessidade de backfill.

ALTER TABLE "users" ALTER COLUMN "passwordHash" DROP NOT NULL;
ALTER TABLE "users" ADD COLUMN "govbrSub" TEXT;
CREATE UNIQUE INDEX "users_govbrSub_key" ON "users"("govbrSub");
ALTER TABLE "users" ADD COLUMN "authProvider" TEXT NOT NULL DEFAULT 'local';
ALTER TABLE "users" ADD COLUMN "profileCompletedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "sessionsValidFrom" TIMESTAMP(3);

CREATE TABLE "govbr_auth_requests" ( /* ... */ );
CREATE TABLE "govbr_session_handoffs" ( /* ... */ );
```

**Todas as operações são aditivas ou afrouxamento.** Nenhuma exige backfill nem rewrite de tabela (no Postgres, `ADD COLUMN` com `DEFAULT` constante não reescreve a tabela desde a versão 11, e índice único aceita múltiplos NULLs). **Não** usar o truque de `DELETE FROM` que o time aplicou em `print_requests`.

Depois: `npm run prisma:generate` e **commitar o client gerado** (o schema gera dentro de `src/`, linha 9).

### 4.2 Camada de domínio

| Arquivo | Responsabilidade |
|---|---|
| `identity/domain/services/govbr-oidc.ts` **(novo)** | Interface. Assinaturas: `buildAuthorizationUrl(params: { state, nonce, codeChallenge }): string`; `exchangeCodeForTokens(params: { code, codeVerifier }): Promise<GovbrTokenSet>`; `verifyIdToken(idToken: string, expectedNonce: string): Promise<GovbrClaims>`; `buildLogoutUrl(): string`. |
| `identity/domain/entities/govbr-auth-request.ts` **(novo)** | Agregado do estado transitório. `static create(props)` gera `state`/`nonce`/`codeVerifier` com CSPRNG; `isExpired()`; `consume()` marca `consumedAt`; `matchesClientSecret(secret: string): boolean` (compara SHA-256 em tempo constante). |
| `identity/domain/entities/govbr-session-handoff.ts` **(novo)** | Agregado do one-time code de entrega de sessão. Mesma disciplina de uso único e binding. |
| `identity/domain/repositories/govbr-auth-request.ts` **(novo)** | `save`, `findByState`, `deleteExpired`. |
| `identity/domain/repositories/govbr-session-handoff.ts` **(novo)** | `save`, `findByCode`, `deleteExpired`. |
| `identity/domain/repositories/user.ts` **(alterar)** | Adicionar `findByGovbrSub(sub: string): Promise<User \| null>`. |
| `identity/domain/entities/user.ts` **(alterar)** | (a) `passwordHash` vira `string \| null` no construtor e em `getPasswordHash()`; (b) novos campos `govbrSub`, `authProvider`, `profileCompletedAt`, `sessionsValidFrom`; (c) `static createFederated(props)` — **não** emite `UserRegisteredEvent`, emite `UserProvisionedFromGovBrEvent`; (d) `linkGovbrIdentity(sub: string)` — grava `govbrSub`, seta `authProvider='govbr'`, **anula `passwordHash`**, atualiza `sessionsValidFrom`; (e) `completeProfile({ birthDate, phone })` seta `profileCompletedAt`; (f) `hasLocalCredential(): boolean`; (g) `invalidateSessions()` seta `sessionsValidFrom = new Date()`; (h) **remover `passwordResetCode`/`passwordResetCodeExpiry` do `toJSON()`** (linhas 141-142) e do `JsonSchema` (195-196) — já vazam hoje; (i) **não incluir `govbrSub` no `toJSON()`**, que é usado simultaneamente como DTO de API e payload de persistência (`prisma-user.ts:19`); (j) `update`/`updateSelf` precisam tolerar `birthDate`/`phone` ausentes para conta federada com perfil incompleto. |
| `identity/domain/services/auth.ts` **(alterar)** | (a) **Guard obrigatório** em `login` antes da linha 25: `if (!user.getPasswordHash()) throw new InvalidCredentialsError()` — com `null`, `bcrypt.compare` lança exceção e derruba a rota de login por senha **para todo mundo**, não só para o federado. (b) Novo método `resolveOrProvisionFromGovBr(claims): Promise<{ user, requiresLinkConfirmation }>` — **não enfraquecer o `register` existente**. |
| `identity/domain/services/password.ts` **(alterar)** | Guards em `changePassword` (18-21), `executeResetPassword` (43-63) e `executeResetPasswordWithCode` (91-105): rejeitar quando `authProvider === 'govbr'`. **Além disso** (endurecimento independente): contador de tentativas com invalidação do código após 5 falhas. |
| `identity/domain/entities/user.ts:116` **(alterar)** | Trocar `Math.random` por `crypto.randomInt` na geração do código de reset. Não é CSPRNG — é previsível a partir do estado do PRNG. |
| `identity/domain/errors/index.ts` **(alterar)** | Novos erros seguindo o padrão (code SCREAMING_SNAKE + mensagem PT-BR + `ErrorType`): `GovbrInvalidStateError`, `GovbrStateExpiredError`, `GovbrStateAlreadyConsumedError`, `GovbrClientBindingMismatchError`, `GovbrTokenExchangeError`, `GovbrInvalidIdTokenError`, `GovbrEmailConflictError`, `GovbrAccountLinkRequiresPasswordError`, `GovbrPjAccountNotSupportedError`, `GovbrConsentDeniedError`. **Corrigir de passagem:** `birth-date.ts:8` lança `new Error()` genérico (→ HTTP 500) em vez do `InvalidBirthDateError` que existe em `errors/index.ts:35-43` e nunca é usado. |

### 4.3 Camada de infraestrutura

| Arquivo | Responsabilidade |
|---|---|
| `identity/infra/services/govbr-oidc-http.ts` **(novo)** | Implementa `GovbrOidcService` usando `fetch` nativo + **`jose`**. `verifyIdToken` deve usar `createRemoteJWKSet` com cache chaveado por **`(issuer, kid)`** e `jwtVerify` com: `algorithms: ['RS256','RS512']` explícito (sem isso sobra superfície para alg confusion — o processo já usa HS256 com `AUTH_JWT_SECRET`), `issuer` (com barra final), `audience = client_id`, `clockTolerance` ~30s. Comparar `nonce` em tempo constante contra o gravado no state. Rejeitar `aud` array que contenha outros clients; validar `azp` quando presente. Fazer `.trim()` nas envs de `client_id`/`client_secret`. |
| `identity/infra/repositories/prisma-govbr-auth-request.ts` **(novo)** | Padrão do módulo: `save` = upsert por id, `xDbToEntity` para reidratar. |
| `identity/infra/repositories/prisma-govbr-session-handoff.ts` **(novo)** | Idem. |
| `identity/infra/repositories/prisma-user.ts` **(alterar)** | (a) Implementar `findByGovbrSub`; (b) `save` grava `govbrSub`, `authProvider`, `profileCompletedAt`, `sessionsValidFrom` nos **dois ramos** do upsert (linhas 31 e 46) — esquecer um compila por causa dos casts `as any` (119-121) e falha em runtime; (c) `userDbToEntity` (107-123) precisa tolerar `passwordHash` null. |
| `identity/infra/services/jwt-auth-token.ts` **(alterar)** | `verify` (20-37) passa a comparar o `iat` do token com `user.sessionsValidFrom` e **rejeitar tokens emitidos antes**. Sem isso, o logout federado (obrigatório na homologação) é cosmético — o JWT próprio de 1 dia continua válido. O mesmo vale para troca de senha e vinculação de conta. |

### 4.4 Camada de aplicação

| Arquivo | Responsabilidade |
|---|---|
| `identity/application/use-cases/start-govbr-login.ts` **(novo)** | Input: `{ client: z.enum(['admin','mobile-web','mobile-app']), clientSecretHash: z.string() }`. **Nunca aceitar URL crua do cliente** (open redirect). Gera state/nonce/code_verifier, persiste em `GovbrAuthRequest`, devolve `{ authorizationUrl }`. |
| `identity/application/use-cases/handle-govbr-callback.ts` **(novo)** | Input: `{ code?, state?, error?, errorDescription? }`. Orquestra a máquina de estados completa (ver 4.6), troca o code, verifica o `id_token`, resolve/provisiona o usuário, emite o JWT próprio, cria o `GovbrSessionHandoff` e devolve `{ redirectUrl }` resolvido a partir de env — **nunca** de `req.headers.host`. |
| `identity/application/use-cases/exchange-govbr-code.ts` **(novo)** | Input: `{ code, clientSecret }`. Valida o binding (SHA-256 do segredo), marca `consumedAt`, devolve `{ token }`. Rota oRPC pública. |
| `identity/application/use-cases/complete-govbr-profile.ts` **(novo)** | Input: `{ birthDate, phone, company?, jobTitle? }`. Rota protegida. Seta `profileCompletedAt`. |
| `identity/application/use-cases/confirm-govbr-account-link.ts` **(novo)** | Prova de posse: recebe o `state` pendente + senha local, valida, vincula, invalida sessões e notifica por e-mail. |
| `identity/application/use-cases/get-govbr-logout-url.ts` **(novo)** | Devolve a URL de logout do IdP para o front-end (a doc exige que a chamada parta do front). |
| `identity/application/subscribers/after-user-provisioned-from-govbr.ts` **(novo)** | Decidir conscientemente: e-mail de boas-vindas diferente do de cadastro manual, ou nenhum. **Não** reaproveitar `UserRegisteredEvent` (`user.ts:62`), que dispara o e-mail de cadastro em `after-user-registered.ts`. |
| `identity/application/subscribers/after-govbr-identity-linked.ts` **(novo)** | Notifica o usuário por e-mail que uma identidade gov.br foi vinculada à conta. Controle detectivo mais barato contra vinculação indevida. |

### 4.5 Camada de apresentação — backend

**Arquivo novo:** `apps/api/src/modules/identity/presentation/http-routes/govbr-callback.ts`

Exporta `handleGovbrCallbackRoute(req: IncomingMessage, res: ServerResponse): Promise<boolean>`.

**Arquivo alterado:** `apps/api/src/modules/_core/presentation/orpc-server/server.ts`

Inserir **antes da linha 113** (montagem do `Headers`), extraindo um pequeno array `rawRoutes` — o callback já tem 100+ linhas e serão 2-3 rotas cruas:

```ts
const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
if (req.method === 'GET' && url.pathname === '/auth/govbr/callback') {
  await handleGovbrCallbackRoute(req, res);
  return;
}
```

Regras do handler:
- Envolver tudo em `try/catch`. **Sempre** responder 302 para a tela de login do cliente com `?error=<code>` — nunca JSON, nunca 500. O pipeline `orpcSafe`/`errorToOrpcError` **não roda** nessa rota.
- Nunca logar a querystring, o `id_token`, o `access_token` nem o `error_description` completo em nível acessível a terceiros.
- A `redirect_uri` enviada ao `POST /token` vem de `GOVBR_REDIRECT_URI` (env), **nunca** derivada de `req.headers.host` (header falsificável, e o `/token` exige igualdade exata).

**Rotas oRPC novas** (arquivos em `identity/presentation/orpc-routes/routes/`, registradas em `orpc-routes/index.ts`):

| Rota | Tipo | Path |
|---|---|---|
| `start-govbr-login.ts` | `publicRoute` | `POST /auth/govbr/start` |
| `exchange-govbr-code.ts` | `publicRoute` | `POST /auth/govbr/exchange` |
| `complete-govbr-profile.ts` | `protectedRoute` | `POST /auth/govbr/complete-profile` |
| `confirm-govbr-account-link.ts` | `publicRoute` | `POST /auth/govbr/confirm-link` |
| `get-govbr-logout-url.ts` | `publicRoute` | `GET /auth/govbr/logout-url` |

**Container:** registrar em `apps/api/src/modules/_di_container/container.ts` seguindo o padrão lazy-singleton da `//#region Services` (linha 233) para o serviço e repositórios, e factories não-memoizadas na `//#region Use Cases` para os use cases. Guard tardio de env idêntico ao de `SUPABASE_*` (linha 431).

### 4.6 Máquina de estados do callback (especificação obrigatória)

Cada caso precisa de erro de domínio próprio e de resposta 302 **indistinguível do ponto de vista de um atacante** (sem oráculo):

| Cenário | Tratamento |
|---|---|
| `error=access_denied` (usuário cancelou/negou consentimento) — **volta sem `code`** | Consumir/queimar o state; 302 para login com mensagem amigável. **Nunca 500.** |
| `state` ausente | 302 com erro genérico |
| `state` desconhecido | idem |
| `state` expirado | idem |
| `state` já consumido (replay) | idem |
| `code` reusado (o gov.br devolve erro) | idem |
| `code` + `state` de fluxos diferentes | idem |
| Binding cliente↔fluxo não confere | idem |
| Conta PJ (claim `cnpj` presente) | erro de domínio dedicado com mensagem clara |
| E-mail colide com outro usuário | `GovbrEmailConflictError` (409), orientando contato — **nunca P2002/500** |
| CPF casa com conta local **com senha ativa** | Fluxo de confirmação por prova de posse (não loga automaticamente) |

### 4.7 Clientes

**Admin** (`apps/admin`)

| Arquivo | O que fazer |
|---|---|
| `src/hooks/useSession.ts` **(novo)** | Extrair de `useLogin.ts:32-54` o bloco `setItem('token')` → `getMe()` → `setQueryData(CURRENT_USER_QUERY_KEY)` → `navigate`. ⚠️ **São QUATRO passos, não três**: extrair **também** o gate `if (user.userType !== 'admin') { removeItem('token'); ... }` (`useLogin.ts:47-51`). Sem ele, um usuário comum vindo do gov.br fica com token válido no `localStorage` do painel e é expulso pelo `ProtectedRoute` com estado `deniedAdmin` e sem mensagem coerente. |
| `src/pages/AuthCallback.tsx` **(novo)** | Lê `?c=<code>` + o segredo do `localStorage`, chama `exchangeGovbrCode`, usa `useSession`. |
| `src/App.tsx` **(alterar)** | Registrar `/auth/callback` como **irmã de `/login`** (após a linha 21), **fora** do `<Route element={<ProtectedRoute />}>` — senão `ProtectedRoute.tsx:13-18` expulsa antes de rodar, porque nesse momento ainda não há token. Adicionar `<Route path="*">`. |
| `src/components/auth/LoginForm.tsx` **(alterar)** | Botão gov.br após a linha 99. |
| `src/components/layout/AdminLayout.tsx:90-95` **(alterar)** | Logout: quando `authProvider === 'govbr'`, após limpar estado local fazer `window.location.href = logoutUrl`. |
| **Infra** | Confirmar/configurar rewrite de SPA no Coolify — não há `vercel.json`/`nginx.conf`/`Dockerfile` versionado, e um GET direto em `/auth/callback` provavelmente devolve 404 sem rewrite. |

**Mobile — web** (escopo atual)

| Arquivo | O que fazer |
|---|---|
| `src/screens/public/AuthCallbackScreen.tsx` **(novo)** | Equivalente ao do admin. |
| `src/navigation/PublicNavigator.tsx:13-22` **(alterar)** | Adicionar `AuthCallback` ao `PublicStackParamList` e ao `Stack.Navigator`. |
| `src/navigation/index.tsx` **(alterar)** | ⚠️ **Dois problemas.** (a) O `linking.config` (11-23) só descreve rotas do Drawer **privado** — um retorno chegando com usuário deslogado cai no `PublicNavigator`, que não tem rota casando, e o code se perde. (b) Os `prefixes` (linha 10) são `['locomotiva://', 'http://192.168.1.12:8081/', 'https://192.168.1.12:8081/']` — **IP de LAN de desenvolvimento hardcoded**. No build web a origem real de produção não está na lista. Trocar por origem de runtime (`window.location.origin` no web / `Linking.createURL('/')`). |
| `src/contexts/auth-context.tsx` **(alterar)** | Novo método `setSession(jwt)`. ⚠️ **Gravar o token não basta:** `isAuthenticated` é `!!authUser` (linha 103), e `authUser` só é preenchido dentro de `getMe()` (33-43). O `setSession` deve fazer `await AsyncStorage.setItem('token', jwt)` **e** `await getMe()` antes de resolver, tratando o estado de carregamento — senão o callback aparenta sucesso e o app fica parado na `PublicStack`. |
| `src/screens/public/LoginScreen.tsx:194-199` **(alterar)** | Botão gov.br abaixo do divisor "Acesso Governamental Seguro", que hoje é puramente decorativo. |

**Mobile — nativo** (fora do escopo atual; só quando houver EAS build)

`app.json` precisará de `scheme`, `ios.bundleIdentifier` e `android.package`; instalar `expo-web-browser` + `expo-linking` + `expo-crypto`; usar `WebBrowser.openAuthSessionAsync` (`ASWebAuthenticationSession` no iOS, Chrome Custom Tabs no Android — **não são WebView**, atendem a exigência do gov.br). Referência de configuração nativa a copiar: `apps/tablet/app.json:12`, que já tem `"package": "com.locomotiva.totem"`.

⚠️ **Custom scheme não é seguro sozinho.** Qualquer app pode registrar `locomotiva://` no Android; a resolução em conflito não é garantida. Combinar com (a) o binding cliente↔fluxo, que torna o code interceptado inútil, e (b) preferir Android App Links / iOS Universal Links (https verificado por `assetlinks.json` / AASA).

---

## 5. Ordem de implementação

Cada etapa é entregável e testável isoladamente.

### Etapa 0 — Higiene e desbloqueio (0,5 dia)

Executar tudo da seção 4.0: rotacionar a credencial vazada, blindar `cleanDatabase`, reduzir o log da linha 127, fixar versão do Node, commitar a migração pendente, rodar `prisma migrate status`.

**Também nesta etapa:** resolver o ambiente de desenvolvimento. Com `redirect_uri` única cadastrada no gov.br, **ninguém desenvolve em `localhost`** sem túnel HTTPS ou subdomínio de homologação dedicado. Isso trava o time inteiro no dia 1 se não for feito antes.

> Receita oficial do roteiro (não estava no plano original): criar um domínio de desenvolvimento tipo `local.minha_aplicacao.gov.br` via `/etc/hosts` nas máquinas dos devs, "evitando a necessidade de configuração de URLs de redirecionamento e logout fixadas em IPs dos desenvolvedores".

**Testável:** `prisma migrate status` limpo; suíte de testes não toca banco de produção; grep confirma que a credencial saiu do repo.

### Etapa 1 — Migração + entidade (1,5 dia)

Schema Prisma, migração manual, `prisma generate`, ajustes em `User`, `prisma-user.ts`, e os **guards de senha** em `auth.ts:25` e nos três fluxos de `PasswordService`.

**Testável:** migração aplica em banco limpo e em cópia da produção; usuários existentes continuam logando normalmente; teste unitário confirma que `login` com `passwordHash: null` retorna `InvalidCredentialsError` (não exceção do bcrypt); teste confirma que `executeResetPasswordWithCode` rejeita conta com `authProvider='govbr'`.

### Etapa 2 — Serviço OIDC isolado (2 dias)

Instalar `jose`. Implementar `GovbrOidcService` + `govbr-oidc-http.ts`. Registrar no container com guard de env.

**Testável de forma totalmente isolada, sem tocar em rota nenhuma.** Escrever um script de scratch que: monta a authorization URL e a abre no navegador; recebe o `code` colado manualmente; troca por tokens; valida o `id_token` contra o JWKS real. Este é o momento de **imprimir o `id_token` decodificado e responder as incertezas da seção 8** (existe `birthdate`? o `sub` é o CPF ou pairwise? `email_verified` vem string ou boolean? o escopo `govbr_confiabilidades_idtoken` é aceito?).

Testes automatizados: alg fora da allowlist é rejeitado; `iss`/`aud`/`nonce`/`exp` errados são rejeitados; cache com `kid` igual entre ambientes não confunde chaves.

### Etapa 3 — Estado do fluxo + máquina de estados (1,5 dia)

Entidades `GovbrAuthRequest` e `GovbrSessionHandoff`, repositórios, `start-govbr-login`, `exchange-govbr-code`, e a rota crua de callback com **toda** a máquina de estados da seção 4.6.

**Testável:** chamar `startGovbrLogin` via oRPC devolve URL válida; bater no callback com state ausente/inválido/expirado/consumido produz 302 com erro (nunca 500); replay do mesmo state é rejeitado; `exchangeGovbrCode` com segredo errado é rejeitado.

### Etapa 4 — Resolução de conta + provisionamento (2 dias)

`findByGovbrSub`, `resolveOrProvisionFromGovBr`, `handle-govbr-callback`, `confirm-govbr-account-link`, erros de domínio, subscribers.

**Testável — três caminhos independentes:**
1. `sub` conhecido → loga direto
2. `sub` novo, CPF casa com conta **sem** senha local → vincula automaticamente
3. `sub` novo, CPF casa com conta **com** senha local → **não loga**, exige confirmação por senha
4. `sub` novo, CPF não casa → provisiona conta nova com `authProvider='govbr'` e perfil incompleto
5. E-mail colide com outro usuário → 409 com mensagem, não 500

### Etapa 5 — Cliente admin (1,5 dia)

`useSession` (com o gate de admin), `AuthCallback`, rota em `App.tsx`, botão no `LoginForm`, logout federado.

**Testável:** fluxo ponta a ponta no navegador com conta gov.br de staging **já promovida a admin**.

### Etapa 6 — Decisão de `userType` e completar perfil (1,5 dia)

⚠️ **Bloqueante para o vídeo de homologação.** Decidir e implementar:

- **Opção A (recomendada):** gravar o vídeo de homologação no **mobile-web**, que aceita `userType='user'`. Custo zero.
- **Opção B:** pré-promover a conta de teste com `npm run promote-to-admin`. ⚠️ O script busca por **e-mail** (`scripts/promote-to-admin.ts:14-31`), e o e-mail da conta gov.br pode não ser o mesmo do cadastro local.
- **Opção C:** ferramenta administrativa de promoção pós-provisionamento.

Nesta etapa também: coluna `profileCompletedAt`, `complete-govbr-profile`, gate no `getMe`/`ProtectedRoute`, telas de "complete seu cadastro" (admin e mobile), **aceite de termos** registrado (data + versão) — hoje o aceite acontece no cadastro manual, e o usuário provisionado nunca vê nada.

**Testável:** usuário federado sem `birthDate`/`phone` é redirecionado para completar cadastro e depois navega normalmente.

### Etapa 7 — Cliente mobile-web (1 dia)

`AuthCallbackScreen`, `PublicNavigator`, correção dos `prefixes`, `setSession` com `getMe`, botão gov.br.

**Testável:** fluxo ponta a ponta no build web do mobile.

### Etapa 8 — Endurecimento e observabilidade (2 dias)

- Binding cliente↔fluxo (segredo CSPRNG + SHA-256)
- Invalidação de sessão via `sessionsValidFrom` no `jwt-auth-token.ts:verify`
- Rate limit em `startGovbrLogin`, `exchangeGovbrCode` e nos fluxos de reset existentes
- `crypto.randomInt` no código de reset + contador de tentativas
- Allowlist fechada de destino de redirect
- Trilha de auditoria mínima (vinculação, provisionamento, logout federado)
- Job/rotina de expurgo de `govbr_auth_requests` e `govbr_session_handoffs` (obrigação LGPD de retenção, não só higiene técnica — a tabela liga CPF a horário de tentativa de login)
- Feature flag `GOVBR_ENABLED` para desligar sem redeploy
- Métricas/alertas: taxa de falha do `/token`, falha de verificação de `id_token`, expiração de state — justamente os sintomas de clock skew, chave errada por ambiente e réplicas, que são os riscos de diagnóstico mais difícil

**Testável:** code interceptado sem o segredo do cliente é inútil; logout federado invalida o JWT próprio; força bruta no reset é barrada.

### Etapa 9 — Logout, LGPD e homologação (1 dia)

Logout federado nos dois clientes; atualizar `PoliticaDePrivacidadeScreen.tsx` e `TermosScreen` declarando os dados recebidos do Login Único, a finalidade, a retenção e o canal do titular; publicar equivalente no admin; gravar o vídeo.

---

## 6. Segurança — o que NÃO pode faltar

### 6.1 Fluxo OIDC

- [ ] **`state`** gerado com CSPRNG, persistido server-side (`govbr_auth_requests`), validado no callback, marcado `consumedAt` (uso único).
- [ ] **Binding cliente↔fluxo (CRÍTICO — login-CSRF / session fixation).** O `state` server-side prova que "alguém iniciou este fluxo", **não** que "este user-agent iniciou". Sem binding, um atacante inicia o fluxo, obtém `code`+`state` válidos da conta gov.br **dele**, induz a vítima a abrir a URL de callback, e a vítima termina logada **na conta do atacante** — tudo que ela fizer depois (upload de `.stl`, dados pessoais, reservas) vai para a conta do atacante.
  **Mitigação:** antes do `startGovbrLogin`, o cliente gera segredo aleatório (CSPRNG), guarda localmente e envia apenas o **SHA-256**; o resgate do one-time code exige o segredo em claro. Fecha o login-CSRF e torna inútil o vazamento do code na URL.
- [ ] **`nonce`** gerado com CSPRNG, gravado no state, **comparado em tempo constante** com o claim `nonce` do `id_token`.
  *Fonte: OpenID Connect Core 1.0, seção de validação do ID Token — **não** o roteiro do gov.br. As Observações do Passo 3 exigem apenas que o nonce seja enviado e que o **state** seja validado. Consequência prática: a homologação do gov.br não vai cobrar isso — é requisito de segurança próprio.*
- [ ] **PKCE S256** com `code_verifier` de 43 a 128 caracteres, gerado com CSPRNG, nunca reusado. Forçar mesmo que o discovery não anuncie.

### 6.2 Validação do `id_token`

- [ ] **`algorithms: ['RS256','RS512']` explícito** no `jwtVerify`. Sem allowlist, sobra superfície para alg confusion — o processo já usa `AUTH_JWT_SECRET` em HS256.
- [ ] `issuer` **com barra final**.
- [ ] `audience = client_id`; rejeitar `aud` array com outros clients; validar `azp` quando presente.
- [ ] `exp` **e** `iat` com `clockTolerance` ~30s. O `id_token` dura 60s. **Garantir NTP no container** — relógio dessincronizado é erro documentado (`invalid_id_token ... {iat=...}`).
- [ ] **Cache JWKS chaveado por `(issuer, kid)`**, nunca só por `kid` — staging e produção compartilham `kid="rsa1"` com modulus diferentes.
- [ ] Se `/userinfo` for chamado: exigir `userinfo.sub === idToken.sub`, descartar se divergir. **Nunca** usar `/userinfo` como fonte de autenticação.
- [ ] Só persistir `email`/`phone` quando `email_verified`/`phone_number_verified` forem `true`.
- [ ] Schema zod tolerante ao tipo booleano/string dos claims `*_verified`.

### 6.3 Vinculação de conta — o ponto mais perigoso

⚠️ **Takeover reverso (não estava no plano original).** O rascunho justificava a vinculação automática por CPF com "o CPF do gov.br é verificado, então é defensável". Isso olha só um lado: **o CPF do lado LOCAL nunca foi verificado.** `/auth/register` é `publicRoute` e `Cpf.fromString` valida apenas dígito verificador — não há prova de posse.

**Cenário de ataque:** o atacante registra hoje uma conta local com o CPF de uma vítima (e-mail e senha dele). Quando a vítima real fizer o primeiro login gov.br, a regra proposta entrega a identidade federada à conta do atacante. A vítima passa a operar dentro de uma conta cuja senha o atacante conhece; o atacante lê tudo que ela fizer e age como ela. **É exatamente o vetor condenado no e-mail, reproduzido no CPF.**

- [ ] **Ordem de resolução:** (1) `findByGovbrSub`; (2) `findByEmailOrCpf(Cpf)`; (3) provisionar.
- [ ] **Vinculação automática por CPF SOMENTE quando** a conta local **não tem credencial local ativa** (`passwordHash` null) ou foi criada pelo próprio fluxo federado.
- [ ] **Conta local COM senha:** não logar automaticamente. Exigir prova de posse — pedir a senha local na mesma sessão ("já existe uma conta com este CPF, confirme a senha para vincular") ou confirmação por link no e-mail cadastrado.
- [x] ~~Ao vincular: anular `passwordHash`~~ **REVISTO (2026-08-07, decisão de produto):** a senha PERMANECE após vincular — a pessoa escolhe entrar com senha ou gov.br, e é isso que permite admin vincular sem se trancar fora do painel (que segue só com senha). E-mail de notificação ao vincular continua recomendado.
- [ ] **Nunca** vincular automaticamente conta com `userType='admin'`.
- [ ] **Nunca** usar e-mail como chave de resolução nem sobrescrever e-mail local a partir das claims. Colisão de e-mail → 409 explicativo, nunca P2002/500.
  *Nota: `update-me.ts:26` permite trocar o próprio e-mail sem verificação nenhuma, então plantar uma colisão é trivial.*

### 6.4 Redirect e entrega de sessão

- [ ] **Allowlist fechada de destino.** `client` é `z.enum(['admin','mobile-web','mobile-app'])`, resolvido no servidor para URLs vindas de env. **Nunca** aceitar URL crua do cliente — seria open redirect que entrega sessão, não só reputação de domínio.
- [ ] Se houver `redirectTo` interno pós-login: aceitar só path relativo começando com `/`, sem `//` nem esquema.
- [ ] `redirect_uri` do `POST /token` vem de `GOVBR_REDIRECT_URI` (env), **nunca** de `req.headers.host` (falsificável; e o `/token` exige igualdade exata).
- [ ] **One-time code**, não JWT na URL. Vida curta (30–60s), uso único, binding com o segredo do cliente. JWT em querystring vai para histórico do navegador, logs de proxy e header `Referer`.

### 6.5 Escalada de privilégio

- [ ] `User.create`/`createFederated` fixam `UserType.USER`. Nenhum campo das claims chega perto de `userType`.
- [ ] O gate `userType === 'admin'` do `useLogin.ts:47-51` é replicado na `AuthCallback` do admin.
- [ ] Promoção a admin continua exclusivamente pelo caminho administrativo existente.

### 6.6 Armazenamento e ciclo de vida de token

- [ ] `access_token` e `id_token` do gov.br **descartados** após validação — não persistir, não logar. Motivo reforçado: **não existe `revocation_endpoint`**, então não haveria como invalidá-los se vazassem.
- [ ] JWT próprio com invalidação server-side (`sessionsValidFrom` conferido no `verify`), atualizado no logout federado, na vinculação e na troca de senha. **Sem isso o logout exigido pelo gov.br é cosmético.**
- [ ] Considerar TTL menor que 1 dia para sessão federada.
- [ ] `toJSON()` limpo: remover `passwordResetCode`/`passwordResetCodeExpiry` (já vazam hoje em `/auth/register` e `getMe`), **não** adicionar `govbrSub`.

### 6.7 Reset de senha — endurecimento independente mas obrigatório

O fluxo existente (`password.ts:66-105`) é vulnerável **hoje**, e a federação o torna mais valioso como alvo. Um guard "conta federada não pode resetar" **não resolve a conta híbrida** (usuário legado com senha que depois vinculou gov.br), que é o alvo mais interessante.

- [ ] `crypto.randomInt` em vez de `Math.random` (`user.ts:116`).
- [ ] Contador de tentativas com invalidação do código após 5 falhas (10⁶ combinações sem limite é força bruta trivial).
- [ ] Rate limit por CPF **e** por IP, no `request` e no `verify`.
- [ ] Política explícita de conta híbrida: **recomendo desativar credencial local e o fluxo de reset por código ao vincular gov.br**.
- [ ] Guard `authProvider === 'govbr'` nos três fluxos de `PasswordService`.

### 6.8 Transporte, logs e segredos

- [ ] HTTPS ponta a ponta (terminado no proxy do Coolify). Em produção, `redirect_uri` e `post_logout_redirect_uri` **obrigatoriamente** `https://`.
- [ ] Todas as credenciais em env, `.trim()` na leitura, nunca hardcoded, nunca commitadas.
- [ ] **Nenhum log** de querystring do callback, body do `/token`, `id_token`, `access_token` ou `error_description` completo. Corrigir `server.ts:127`.
- [ ] Rate limit em `startGovbrLogin` — rota pública que **insere linha no banco** a cada chamada.
- [ ] Expurgo com TTL de `govbr_auth_requests` e `govbr_session_handoffs` (LGPD: minimização + retenção definida).
- [ ] ⚠️ CORS hoje é `Access-Control-Allow-Origin: '*'` (`server.ts:41` + CORSPlugin linha 26), sem `Allow-Credentials`. O desenho proposto (Bearer + one-time code) é compatível. Se algum dia migrar para cookie `HttpOnly`, será necessário trocar para allowlist de origem — mudança que afeta os dois clientes.

### 6.9 Trilha de auditoria e notificação

- [ ] **Não existe módulo/tabela de auditoria no projeto** e o plano original não criava um. Sem isso não há como detectar nem investigar um takeover — que é justamente o risco ALTO levantado. Criar registro mínimo de: provisionamento federado, vinculação de identidade, logout federado, tentativa de vinculação recusada por falta de prova de posse.
- [ ] E-mail ao usuário sempre que uma identidade gov.br for vinculada a uma conta existente.

---

## 7. Variáveis de ambiente novas

### Para colar em `apps/api/.env.exemple`

> ⚠️ **Antes de mexer neste arquivo:** remover a connection string real da linha 12 e rotacionar a credencial (seção 4.0).

```bash
# ─── Login Único gov.br (OIDC) ───────────────────────────────
# Feature flag: desliga o botão nos clientes e derruba as rotas sem redeploy
GOVBR_ENABLED=false

# Credencial recebida da SGD (cifrada com PGP).
# ATENÇÃO: sem espaço/quebra de linha ao final — causa 401 e invalid_client.
GOVBR_CLIENT_ID=
GOVBR_CLIENT_SECRET=

# Homologação:  https://sso.staging.acesso.gov.br
# Produção:     https://sso.acesso.gov.br   (INFERIDO — confirmar na credencial de produção)
GOVBR_ISSUER=https://sso.staging.acesso.gov.br

# URL única cadastrada na credencial. O despacho por cliente é interno.
GOVBR_REDIRECT_URI=https://api.exemplo.ma.gov.br/auth/govbr/callback

# Cadastrada no campo "URL de Log Out" da credencial.
GOVBR_POST_LOGOUT_REDIRECT_URI=https://admin.exemplo.ma.gov.br/login

# Separados por espaço. Começar pelo mínimo e adicionar incrementalmente.
# 'govbr_confiabilidades_idtoken' é instruído pelo roteiro mas NÃO consta no
# discovery — testar antes de adotar (ver seção 8).
GOVBR_SCOPES="openid email profile"

# Destinos permitidos (allowlist). Nunca aceitar URL vinda do cliente.
GOVBR_ADMIN_REDIRECT_URL=https://admin.exemplo.ma.gov.br/auth/callback
GOVBR_MOBILE_WEB_REDIRECT_URL=https://app.exemplo.ma.gov.br/auth/callback
GOVBR_MOBILE_APP_REDIRECT_URL=locomotiva://auth/callback

# ─── Variáveis já usadas mas AUSENTES deste arquivo ──────────
SUPABASE_URL=
SUPABASE_SECRET_KEY=
STORAGE_BUCKET=
```

### Linhas correspondentes em `apps/api/src/modules/env.ts`

```ts
// Dentro do envSchema existente (z.object). TODAS .optional().
// Motivo: envSchema.parse(process.env) roda no IMPORT (linha 23) — uma
// variável obrigatória ausente derruba a API inteira no boot, não só o
// login gov.br. Mesma convenção já usada para SUPABASE_* (linhas 16-20),
// que são validadas tardiamente no container (container.ts:431).

GOVBR_ENABLED: z.coerce.boolean().optional(),
GOVBR_CLIENT_ID: z.string().optional(),
GOVBR_CLIENT_SECRET: z.string().optional(),
GOVBR_ISSUER: z.string().url().optional(),
GOVBR_REDIRECT_URI: z.string().url().optional(),
GOVBR_POST_LOGOUT_REDIRECT_URI: z.string().url().optional(),
GOVBR_SCOPES: z.string().optional(),
GOVBR_ADMIN_REDIRECT_URL: z.string().url().optional(),
GOVBR_MOBILE_WEB_REDIRECT_URL: z.string().url().optional(),
GOVBR_MOBILE_APP_REDIRECT_URL: z.string().optional(), // custom scheme não passa em z.url()
```

**Guard tardio no container** (`apps/api/src/modules/_di_container/container.ts`, `//#region Services`, padrão idêntico ao da linha 431):

```ts
private _govbrOidcService?: GovbrOidcService;

public getGovbrOidcService(): GovbrOidcService {
  if (!this._govbrOidcService) {
    if (!env.GOVBR_CLIENT_ID || !env.GOVBR_CLIENT_SECRET
        || !env.GOVBR_ISSUER || !env.GOVBR_REDIRECT_URI) {
      throw new Error("Variáveis GOVBR_* não configuradas.");
    }
    this._govbrOidcService = new HttpGovbrOidcService({
      clientId: env.GOVBR_CLIENT_ID.trim(),
      clientSecret: env.GOVBR_CLIENT_SECRET.trim(),
      issuer: env.GOVBR_ISSUER,
      redirectUri: env.GOVBR_REDIRECT_URI,
      scopes: (env.GOVBR_SCOPES ?? "openid email profile").split(" "),
    });
  }
  return this._govbrOidcService;
}
```

**Também configurar no Coolify** (dev e prod), e nos clientes: `VITE_GOVBR_ENABLED` (admin) e `EXPO_PUBLIC_GOVBR_ENABLED` (mobile) para esconder o botão quando desligado.

---

## 8. Pendências e incertezas

### 8.0 ✅ RESOLVIDO — handshake real executado em 2026-08-05

Login completo feito contra `sso.staging.acesso.gov.br` com a credencial
`h-locomotiva-dev.inova.ma.gov.br`, via `scripts/govbr-handshake.ts`.

| Incerteza | Resultado medido |
|---|---|
| `subject_type` da credencial | **`public`** — o `sub` é o CPF, não pseudônimo por cliente |
| Formato do `sub` | **11 dígitos, sem pontuação.** O exemplo `"123456789-00"` da doc não se aplica a esta credencial. O código normaliza mesmo assim. |
| `sub` vs `preferred_username` | **Idênticos** nesta credencial |
| Data de nascimento | **Não vem** — confirmado empiricamente, não só pela doc |
| `email` / `email_verified` | Chegou verificado |
| `picture` | Chegou |
| `phone_number` | Não chegou (escopo `phone` removido — ver abaixo) |
| `social_name` | Não chegou (conta sem nome social) |

**Consequência de projeto:** a vinculação de conta por CPF é viável. Se o
`subject_type` fosse `pairwise`, todo o desenho da Etapa 4 mudaria.

**`redirect_uri` cadastrada (descoberta por tentativa):**
`https://locomotiva-dev.inova.ma.gov.br/auth/govbr/callback` — no domínio do
**app mobile**, não da API. Consequência: o retorno cai na SPA, que repassa o
`code` para a API fazer a troca (o `client_secret` nunca sai do servidor).

**Escopo `phone` removido** de `GOVBR_SCOPES`: pedi-lo faz o gov.br exigir
telefone verificado, disparando validação por SMS que não é entregue em
homologação. O telefone é coletado no "complete seu cadastro" de qualquer forma.

**Credenciais validadas sem navegador** via `grant_type=client_credentials`:
credencial correta devolve `400 invalid_scope` (autenticou, recusou o escopo),
enquanto secret ou client_id adulterados devolvem `401 Bad credentials`. A
mensagem de erro revela os escopos provisionados: `phone, openid,
govbr_confiabilidades, profile, govbr_empresa, email,
govbr_confiabilidades_idtoken`.

---

### 8.1 Resolver com a credencial de homologação (Etapa 2, script de scratch)

Estas são as mais importantes — todas se resolvem **fazendo um login real e imprimindo o `id_token` decodificado**. Fazer isso **antes** de orçar as telas de "complete seu cadastro".

| # | Incerteza | Como confirmar | Impacto se der o contrário do esperado |
|---|---|---|---|
| 1 | **`subject_types_supported: ["public","pairwise"]`** — se a credencial for `pairwise`, o `sub` **não é o CPF**, é pseudônimo por client. | Inspecionar o `sub` do `id_token` real. Confirmar com a SGD no chamado da credencial. | **Derruba toda a estratégia de vínculo por CPF.** Seria preciso outro caminho de resolução. |
| 2 | **`birthDate` realmente não vem?** | Decodificar o `id_token` e chamar `/userinfo`, procurando `birthdate`. | Se vier, elimina a etapa "complete seu cadastro" — economia de ~1,5 dia. |
| 3 | **Escopo `govbr_confiabilidades_idtoken`** — instruído pelo roteiro como padrão mas **ausente** de `scopes_supported` nos dois discovery. | Adicionar ao `/authorize` e ver se retorna `invalid_scope`. Se retornar, remover e abrir chamado perguntando se precisa de habilitação por `client_id`. | Nenhum se ficarmos só com `openid email profile`. Bloqueia só o uso de `reliability_info`. |
| 4 | **`email_verified` vem string ou boolean?** | Inspecionar o `id_token` real. | Schema zod já tolerante cobre os dois — mas confirmar evita surpresa. |
| 5 | **Formato do `sub`** — com ou sem hífen (a doc se contradiz). | Inspecionar. Comparar com `preferred_username`. | `Cpf.fromString` normaliza, então o código sobrevive; a premissa é que não. |

**Comandos úteis:**

```bash
# Discovery ao vivo — fonte de verdade para endpoints e metadata
curl -s https://sso.staging.acesso.gov.br/.well-known/openid-configuration | jq

# JWKS de staging (note o kid "rsa1" — confira que difere do de produção)
curl -s https://sso.staging.acesso.gov.br/jwk | jq
curl -s https://sso.acesso.gov.br/jwk | jq '.keys[0].n[0:20]'

# Decodificar o payload do id_token recebido (sem validar assinatura)
echo "$ID_TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null | jq
```

### 8.2 Resolver com o time / infraestrutura

| # | Pendência | Como confirmar |
|---|---|---|
| 6 | **Em que domínio público a API, o admin e o mobile respondem em produção?** Se já for `*.ma.gov.br`, o principal bloqueador externo some. | Perguntar ao time; conferir no painel do Coolify (`coolify-vps.inova.ma.gov.br`). |
| 7 | **Quais URLs já constam na credencial de homologação** (redirect_uri e "URL de Log Out")? | Ler o documento de credencial já em mãos. Se a URL escolhida não bater → `invalid_grant`. |
| 8 | **Drift em `_prisma_migrations`.** | `npx prisma migrate status` contra produção, **antes** de criar a migração. |
| 9 | **A API roda com mais de uma réplica no Coolify?** (base do argumento "tabela em vez de memória"). | Painel do Coolify. **A decisão de usar tabela permanece correta por outros motivos**: uso único do state exige persistência, e memória não funciona no fluxo de deep link. |
| 10 | **Túnel/subdomínio de desenvolvimento.** | Definir na Etapa 0. Receita oficial: `local.<app>.gov.br` no `/etc/hosts`. |

### 8.3 Não documentado pelo gov.br — perguntar à SGD

Canal oficial atual: **`integracaoid@gestao.gov.br`**. ⚠️ Muita documentação de terceiros ainda circula `integracao-acesso-govbr@economia.gov.br` (endereço antigo) — usar o errado custa dias de e-mail não respondido.

| # | Pendência | Observação |
|---|---|---|
| 11 | **É possível cadastrar múltiplas `redirect_uri`?** | O roteiro usa singular em todos os pontos ("a URI de retorno cadastrada", "a Redirect URI adicionada na credencial"). A favor do plural: o Portal de Pós-Integração tem tipo de solicitação nomeado "Atualização de URLs". Nenhuma fonte primária resolve. **A arquitetura recomendada (uma única `redirect_uri` na API com despacho por state) é imune à resposta** — por isso não é bloqueante. |
| 12 | **Liberação de IP no firewall (produção).** | Erro documentado: `Connection reset by peer` no `POST /token`, com solução "enviar o `client_id` e IP da aplicação". Não há formulário dedicado, lista de faixas nem SLA. **Impacta escolha de infra** — o IP de egress precisa ser fixo. Perguntar **antes** de dimensionar produção. |
| 13 | **Rate limits e SLA.** | Não publicados. A página de retornos padrão lista `429` genericamente, o que sugere throttling sem valor público. Enquanto isso: retry exponencial em 429/5xx, cachear JWKS, nunca chamar `/userinfo` por requisição. |
| 14 | **`acr_values` existe?** | `acr_values_supported` não aparece nos discovery e `acr_values` não é mencionado no roteiro. Assumir que não dá para exigir nível de confiabilidade no `/authorize` — só verificar depois pelo `amr`. |
| 15 | **Prazo de análise de alteração de URLs.** | ⚠️ **Correção:** os "10 dias úteis" citados em rascunhos anteriores **não existem em nenhuma página do roteiro**. Os únicos prazos publicados são `Teste/Homologação: 3 Dias` e `Produção: 3 dias`, e são prazos de **envio da credencial**, não de análise. A página de Alteração de Configuração **não declara SLA**. Tratar como risco de cronograma **sem número**. |

### 8.4 Correções de fatos que estavam errados nos rascunhos

Registrado para que ninguém reintroduza:

| Afirmação anterior | Correção |
|---|---|
| "`claims_supported` não tem `birthdate`, logo não vem" | Prova inválida — o `claims_supported` do gov.br omite claims que ele próprio documenta (`social_name`, `amr`, `reliability_info`...). Usar a página *Escopos de Atributos* e o exemplo do `/userinfo`. |
| "O `sub` é o CPF, 11 dígitos sem pontuação, validado" | O exemplo oficial do `id_token` traz `"123456789-00"` **com hífen**. Usar `preferred_username` para o CPF. E `subject_types` inclui `pairwise`. |
| "Espaço no secret gera 401 'Bad credentials', sintoma `%20`" | Três erros distintos fundidos. **(a)** espaço após o **secret** → `401 Unauthorized: [no body]`; **(b)** espaço após o **client_id** → `invalid_client`, e é aqui que o sintoma é `%20`; **(c)** `"Bad credentials"` → causa documentada é "credencial do client_id incorreta", solução é montar o Basic corretamente. |
| "Prazo de 10 dias úteis para análise" / "Gerente de Projeto da Diretoria de Identidade Digital" | Ambos **inexistentes** na documentação. |
| "Escopos `poav2_*` também não constam no discovery" | Erro de categoria — `poav2_*` são nomes de **operação/permissão** da API de Procuração, não escopos OIDC. Lista real de `scopes_supported` (idêntica nos dois ambientes): `openid`, `profile`, `email`, `phone`, `govbr_empresa`, `govbr_confiabilidades`, `govbr_recupera_certificadox509`. |
| "Conferir o nonce contra o `id_token` — fonte: Passo 3" | Misatribuição. O roteiro só exige enviar o nonce e validar o **state**. A comparação do nonce vem do **OpenID Connect Core 1.0**. Requisito correto, fonte errada — e importa porque a homologação não vai cobrar isso. |
| "`users` nunca foi mexida em migração" | Falso. `20260323194539_make_cpf_nullable:2` faz `DROP NOT NULL`, e **duas** migrações consecutivas (`20260325190509:8` e `20260330205638:11`) reexecutam o mesmo `SET NOT NULL` — sintoma forte de histórico remendado. |
| "3 clientes" | São **4 apps**. O tablet está fora de escopo por autenticar dispositivo via `x-api-key`, não pessoa — mas isso precisa ser declarado, não omitido. |
| "Node 22, disponível" | Não há `engines`, `.nvmrc` nem Dockerfile no repo. `fetch` global existe a partir do Node 18; fixar a versão antes de depender disso. |

**Âncoras de linha corrigidas:** `User.JsonSchema` birthDate está em `user.ts:190` (189 é `cpf`); o `deleteMany` comentado está em `feed-db-dev.ts:231`; a ordem real em `schema.prisma` é `cpf(21)`, `birthDate(22)`, `passwordHash(23)`, `lastPasswordResetDate(24)`.

---

## 9. Bloqueadores não-técnicos

### 9.1 Domínio oficial de governo — **status: a confirmar**

✅ **Confirmado verbatim no roteiro:** "Para a disponibilização das credenciais de produção, é imprescindível que o sistema a ser integrado esteja hospedado em um domínio oficial de governo (ex.: gov.br, mil.br, edu.br, jus.br, leg.br, def.br, mp.br, tc.br)", conforme art. 3º da **Portaria SGD/MGI nº 7.076, de 02/10/2024**. E em produção: "SÃO PERMITIDAS APENAS URLS com HTTPS".

⚠️ **Rebaixado de "bloqueador definitivo" para "a confirmar".** Os workflows apontam para `https://coolify-vps.inova.ma.gov.br/api/v1/deploy` e o e-mail do time é `@secti2.ma.gov.br` — a infraestrutura já está sob `ma.gov.br`. Nenhum `.env` versionado tem a URL pública de produção, então isso nunca foi verificado.

**Ação:** levantar em que domínio a API e o admin respondem hoje. Se já for `*.ma.gov.br`, **o bloqueador some** e o roadmap muda substancialmente. Se for domínio privado, a solução (subdomínio no `ma.gov.br` já existente) é operacional e barata.

Homologação **não** exige domínio de governo.

### 9.2 Cadastro da `redirect_uri` e da "URL de Log Out"

A `redirect_uri` do `/authorize` e a `post_logout_redirect_uri` precisam estar previamente cadastradas na credencial. URL não cadastrada → `invalid_grant` ("a URL utilizada na chamada authorize não está cadastrada").

- **Verificar as URLs já cadastradas ANTES de fixar o path** — não descobrir isso no primeiro teste.
- Alteração: Portal do Serviço de Integração, botão **"Acompanhamento"** > aba **"Enviar dados/dúvidas"** (integrações em andamento) ou Portal de Pós-Integração, botão **"Iniciar"** (integrações concluídas). ⚠️ **Sem SLA publicado** — tratar como risco de cronograma sem número.
- A arquitetura de **uma única `redirect_uri` na API** com despacho interno por cliente minimiza a dependência desse processo: cadastra uma vez e nunca mais mexe.

### 9.3 Homologação → produção

**Requisito verbatim:**

> "A homologação será realizada através da demonstração por vídeo anexado ao processo, do fluxo abaixo:
> - o procedimento de login, com o botão de redirecionamento para autenticação com o texto **"Entrar com o GOV.BR"**;
> - o redirecionamento para o serviço, e
> - e o procedimento de logout.
> Importante salientar que a **barra de endereços do navegador deve estar visível durante todo o processo**."

Prazos publicados: **3 dias** para credencial de homologação, **3 dias** para credencial de produção.

⚠️ **Existe um modelo oficial de vídeo** — `arquivos/exemplo_comprovacao_integracao.mp4`, linkado na página de solicitação de credencial. Consultar antes de gravar; elimina ambiguidade de enquadramento e reduz risco de reprovação por forma.

⚠️ **O item (3), logout, é justamente o requisito hoje totalmente ausente.** Sem ele o vídeo reprova mesmo com o login funcionando.

⚠️ **Decidir onde gravar (seção 5, Etapa 6):** o admin barra usuário comum. Recomendação: gravar no **mobile-web**.

Conta de teste: criar em `https://sso.staging.acesso.gov.br/` (padrão documentado — nome da mãe `MAMAE`, nascimento `01/01/1980`; nas etapas de validação facial escolher "Não tenho celular" > "Tentar de outra forma"). ⚠️ Staging **não tem acesso à base da Receita Federal**, então qualquer CPF sintaticamente válido serve. **Não existe lista oficial de CPFs de teste** nem contas pré-criadas com selos específicos.

Anexar em `https://solicitacao.servicos.gov.br/`.

### 9.4 Identidade visual do botão

Não existe manual de marca em PDF. A norma é remissiva:

> "A chamada para autenticação deverá ocorrer pelo botão com o conteúdo **Entrar com GOV.BR**. Para o formato do botão, seguir as orientações do Design System de Governo."

Link exato citado no roteiro:
`https://webcomponent-ds.estaleiro.serpro.gov.br/?path=/story/componentes-signin--tipo-externo-com-texto`

⚠️ **Correção a um rascunho anterior:** a afirmação "só o TEXTO é verificado, replicar o visual manualmente é aceitável" é **suposição sem fonte**. O requisito citado é o próprio Design System, que especifica cor, proporção e o logotipo GOV.BR — que é marca registrada. O custo de errar é uma rodada de reprovação.

**Recomendação:** embutir o **SVG oficial** do botão do GOVBR-DS (asset estático, funciona tanto em MUI quanto em `react-native-svg`) em vez de recriar o visual. Se houver dúvida, perguntar no Portal de Integração antes de gravar o vídeo — é mais barato que reprovar.

⚠️ **Divergência de grafia na própria doc:** "Entrar com GOV.BR" (Passo 1, descrição do botão) vs "Entrar com o GOV.BR" (seção de homologação). Usar o rótulo do componente do DS.

### 9.5 LGPD

Obrigação verbatim do integrador:

> "O órgão fica ciente que, ao integrar os serviços de identidade digital [...] fica responsável pelo tratamento dos dados dos usuários em conformidade com a LGPD (Lei 13.709/2018). Isso inclui:
> - Controlar o uso dos dados recebidos (ex.: nome, e-mail) e garantir sua correta gestão;
> - Elaborar um Aviso de Privacidade transparente;
> - Fornecer informações claras aos usuários e manter canais para solicitações de privacidade."

Entregável de conteúdo/jurídico — envolver o responsável pelo produto. Referência sugerida pela própria doc: `gov.br/governodigital/pt-br/privacidade-e-seguranca/framework-guias-e-modelos`.

Incluir: retenção definida de `govbr_auth_requests` (a tabela liga CPF a horário de tentativa de login) e o aceite de termos no fluxo de "complete seu cadastro" — hoje o aceite só acontece no cadastro manual, e o usuário provisionado automaticamente **nunca vê nada**.

### 9.6 Obrigação continuada pós-integração

⚠️ **São DOIS reportes mensais distintos**, não um. Ambos até o **dia 05** de cada mês, pelo Portal de Pós-Integração (art. 13 da Portaria 7.076/2024):

1. **"Atualização das integrações dos portais de serviço"**
2. **"Atualização de integrações disponibilizadas para diversos órgãos/entidades públicas"**

Após o primeiro envio, apenas informações incrementais. **Definir o responsável antes do go-live** e verificar qual dos dois (ou ambos) se aplica.

### 9.7 Suporte e rollback

Nenhum plano previa o cenário "usuário não consegue entrar" após o go-live (conta legada com CPF divergente, e-mail duplicado, CPF de terceiro plantado). É necessário:

- Roteiro de suporte escrito
- Ferramenta administrativa de vinculação/desvinculação manual
- **Política de desvinculação e conta órfã:** usuário federado não tem senha. Se ele quiser deixar de usar gov.br, ou se a credencial de produção nunca sair (bloqueador 9.1), essas contas ficam **sem caminho de acesso**. Definir fallback: definir senha local com verificação por e-mail.
- **Renovação de sessão:** não há `refresh_token` e o JWT dura 1 dia. Ao expirar, o usuário federado cai numa tela onde só existe login por senha — que ele não tem. Garantir o botão gov.br na tela e re-autenticação federada disparada pelo 401 no link do oRPC.
- **Feature flag `GOVBR_ENABLED`** para desligar em produção sem redeploy (SSO fora do ar, escopo rejeitado). Com as variáveis já sendo `.optional()`, o custo é quase zero.
- **Política escrita para o usuário legado** que passa a usar gov.br: mantém as duas formas de entrar? A senha é desativada? Ele é avisado? Sem isso, cada desenvolvedor decide diferente em cada ponto do código.