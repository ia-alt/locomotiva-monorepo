# Sessão Persistente ("continuar conectado") — Arquitetura

> Documento de referência do que foi construído em 2026-08-31, no branch
> `integracao-meu-gov`, sobre o código de produção (main mesclada).
>
> **Escopo:** app mobile (web e nativo) e painel admin. O tablet/totem usa
> `x-api-key` e não é afetado.
>
> **Estado:** implementado e compilando nos 3 apps. A migration
> `20260831120000_refresh_tokens` está criada mas **ainda não aplicada**
> (rodar `npx prisma migrate deploy`). O `.env` local está com TTLs de
> TESTE (2 min / 20 min) — remover antes de produção.

---

## 1. O que faz

Login uma única vez — por senha **ou** pelo gov.br — e a pessoa permanece
conectada: fecha a aba, volta no dia seguinte, e cai direto no perfil. A
sessão só termina de dois jeitos:

1. **Clicando em "Sair"** — que agora revoga a sessão **no servidor** (não é
   só apagar o token do navegador) e também encerra a sessão do gov.br;
2. **Ficando 30 dias inteiros sem usar o app** — a validade é *deslizante*:
   cada uso renova o prazo, então quem entra ao menos uma vez por mês nunca
   cai.

É o mesmo modelo de sessão do Instagram/Facebook: conveniência de nunca
redigitar senha, sem abrir mão de poder derrubar uma sessão na hora.

---

## 2. Por que DOIS tokens

| | Token de acesso | Refresh token |
|---|---|---|
| Formato | JWT assinado (`jsonwebtoken`) | 256 bits aleatórios (CSPRNG), opaco |
| Validade | **15 min** (`AUTH_ACCESS_TOKEN_TTL_SECONDS`) | **30 dias** (`AUTH_REFRESH_TOKEN_TTL_SECONDS`), renovada a cada uso |
| Onde vive | Só no cliente; o servidor não guarda nada | Cliente + **sha256 no banco** (`refresh_tokens`) |
| Uso | Vai no header `Authorization` de TODA request | Só sai do storage para renovar (`/auth/refresh`) ou encerrar (`/auth/logout`) |
| Revogável? | **Não** — JWT vale até expirar, não importa o que aconteça | **Sim** — uma linha no banco; logout marca `revokedAt` |

O ponto central: **um JWT não pode ser cancelado**. Se a sessão inteira
fosse um JWT de 30 dias (a alternativa "1 linha de código"), um token
vazado funcionaria por um mês e o botão "Sair" seria cosmético. Separando
em dois, o token que trafega em toda request vale só 15 minutos — janela
mínima de dano — e o que sustenta os 30 dias fica registrado no banco,
onde pode ser morto a qualquer momento.

**Alternativa considerada e descartada:** sessão opaca única no banco
(sem JWT). Entregaria o mesmo comportamento com menos peças, mas o padrão
de dois tokens é o canônico da indústria, escala se o middleware um dia
parar de consultar o banco por request, e mantém o `authMiddleware`
existente intocado.

---

## 3. Modelo de dados

```prisma
model RefreshToken {
  id        String    @id          // UUID da linha
  tokenHash String    @unique      // sha256 do valor entregue ao cliente
  userId    String                 // dono da sessão (FK → users, cascade)
  familyId  String                 // cadeia de rotação — a família É a sessão
  expiresAt DateTime               // fim da validade desta geração
  usedAt    DateTime?              // preenchido quando o token é rotacionado
  revokedAt DateTime?              // preenchido no logout ou na detecção de reuso
  createdAt DateTime  @default(now())
}
```

Decisões campo a campo:

- **`tokenHash`, nunca o token** — mesmo padrão do `ApiKey.keyHash` já
  existente no projeto. Um vazamento do banco não vaza sessões: sha256 não
  se inverte.
- **`familyId`** — o primeiro token do login cria a família; cada renovação
  gera um sucessor NA MESMA família. Logout e detecção de roubo revogam a
  família inteira de uma vez, não importa quantas gerações existam.
- **`usedAt` separado de `revokedAt`** — "usado" é o estado normal de um
  token que foi trocado na rotação; "revogado" é morte da sessão. A
  distinção é o que permite detectar reuso (§7).
- **FK com `onDelete: Cascade`** — apagar um usuário derruba as sessões dele.
- **Índices** em `familyId` (revogação em lote), `userId` e `expiresAt`
  (expurgo futuro).

---

## 4. Peças e responsabilidades

### Backend (`apps/api`, módulo `identity`)

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Domínio (entidade) | `domain/entities/refresh-token.ts` | O token: geração criptográfica, hash, estados |
| Domínio (contrato) | `domain/repositories/refresh-token.ts` | Interface de persistência, com consumo atômico |
| Domínio (serviço) | `domain/services/refresh-token.ts` | As 3 operações da sessão: emitir, rotacionar, revogar |
| Domínio (erro) | `domain/errors` → `InvalidRefreshTokenError` | 401 com mensagem única para todo refresh inválido |
| Infra | `infra/repositories/prisma-refresh-token.ts` | Implementação Prisma do contrato |
| Infra | `infra/services/jwt-auth-token.ts` | (alterado) TTL do JWT vem do env, não mais `"1d"` fixo |
| Aplicação | `application/use-cases/refresh-session.ts` | Caso de uso do refresh |
| Aplicação | `application/use-cases/logout.ts` | Caso de uso do logout |
| Aplicação | `login.ts` + 3 use cases gov.br | (alterados) passam a devolver o par de tokens |
| Apresentação | `presentation/orpc-routes/routes/refresh-session.ts`, `logout.ts` | 2 rotas públicas novas |
| DI | `_di_container/container.ts` | Fiação: repo e service singletons, use cases por request |

### Frontend

| App | Arquivo | Responsabilidade |
|---|---|---|
| mobile | `locomotiva-api/session.ts` | Storage do par + renovação *single-flight* |
| mobile | `locomotiva-api/link.ts` | Interceptador: 401 → renova → repete a chamada |
| mobile | `contexts/auth-context.tsx` | Guarda o par no login; logout revoga no servidor + gov.br |
| mobile | `screens/public/GovbrCallbackScreen.tsx` | Repassa o refresh token nos 3 desfechos gov.br |
| admin | `services/api.ts` | Mesmo interceptador + `encerrarSessao()` |
| admin | `hooks/useLogin.ts`, `ProtectedRoute.tsx`, `AdminLayout.tsx` | Usam os helpers da sessão |

---

## 5. Cada função e o que ela faz

### 5.1 Entidade `RefreshToken` (`domain/entities/refresh-token.ts`)

| Função | O que faz |
|---|---|
| `static create({ userId, validoPorSegundos, familyId? })` | Nasce um token: sorteia 32 bytes por CSPRNG (`randomBytes`) em base64url, calcula o sha256, define `expiresAt = agora + TTL`. Sem `familyId` (login) cria família nova; com (rotação) herda a existente. Devolve `{ token, rawToken }` — o `rawToken` é o valor que vai ao cliente e **não é guardado em lugar nenhum**; só existe neste instante. |
| `static restore(props)` | Reconstrói a entidade a partir da linha do banco. Não valida nada: o registro já existe. |
| `static hashRawToken(raw)` | sha256 em hex. É o único caminho para reencontrar um token no banco a partir do valor que o cliente apresentou — já que o valor cru nunca foi persistido. |
| `get tokenHash / usedAt / revokedAt` | Leitura dos estados. `tokenHash` fica fora do `toJSON()` de propósito: é segredo. |
| `wasUsed()` | `true` se o token já foi trocado numa rotação. Apresentá-lo de novo depois disso é o sinal de reuso (§7). |
| `toJSON()` | Serialização SEM o hash — só o que pode sair do domínio. |

### 5.2 Contrato `RefreshTokenRepository` (`domain/repositories/refresh-token.ts`)

| Função | O que faz |
|---|---|
| `save(token)` | Persiste (upsert). |
| `findByTokenHash(hash)` | Busca pelo sha256. `null` se não existe. |
| `consumeByTokenHash(hash, agora)` | **Coração da segurança da rotação.** Marca o token como usado E verifica que ele ainda estava ativo, em UMA operação atômica. Devolve `null` se não existe, já foi usado, foi revogado ou expirou. |
| `revokeFamily(familyId, agora)` | Marca `revokedAt` em toda a família — logout e resposta a reuso. |
| `deleteExpired(agora)` | Expurgo dos vencidos (retenção mínima / LGPD). Existe no contrato; o job que chama fica para depois, como nos repos gov.br. |

### 5.3 `PrismaRefreshTokenRepository` (`infra/repositories/prisma-refresh-token.ts`)

Implementa o contrato acima. O detalhe que importa é o `consumeByTokenHash`:

```ts
const { count } = await prisma.refreshToken.updateMany({
    where: { tokenHash, usedAt: null, revokedAt: null, expiresAt: { gt: agora } },
    data: { usedAt: agora },
});
if (count === 0) return null;   // perdeu a corrida, ou o token não vale
```

As condições vão no `WHERE` do próprio `UPDATE`. Se duas renovações
simultâneas chegarem com o mesmo token, o Postgres garante que só uma
encontra a linha ainda ativa — `count === 1` significa "eu venci a
corrida". Ler-e-depois-gravar abriria uma janela em que as duas passariam.
É o mesmo padrão do `consumeByState` do gov.br, já revisado e aprovado.

### 5.4 `RefreshTokenService` (`domain/services/refresh-token.ts`)

O único lugar que sabe emitir, rotacionar e revogar sessão — os 5 pontos
de login chamam ele, nenhum use case duplica a lógica (padrão `checkX`
compartilhado no domain service). Recebe o TTL pelo construtor, vindo do
container: **o domínio não lê configuração**.

| Função | O que faz |
|---|---|
| `issueSession(user)` | Abre sessão nova: cria `RefreshToken` (família nova), salva, pede o JWT de acesso ao `AuthTokenService`, devolve o par `{ token, refreshToken }`. Chamado por: login por senha e os 3 desfechos autenticados do gov.br. |
| `rotate(rawToken)` | O refresh. (1) hash do valor recebido; (2) `consumeByTokenHash` atômico; (3) se falhou E o token existe já-usado → **reuso detectado** → `revokeFamily` + `InvalidRefreshTokenError`; se falhou por qualquer outro motivo → mesmo erro (não se diz ao atacante qual foi); (4) carrega o usuário — se foi apagado, revoga a família e erro; (5) cria o sucessor NA MESMA família com **TTL cheio de novo** (validade deslizante); (6) devolve o par novo. |
| `revoke(rawToken)` | O logout. Acha o token pelo hash e revoga a **família inteira**. Idempotente de propósito: token desconhecido não é erro — a sessão que ele representava já não existe, que é exatamente o estado desejado. Revogar a família (e não só o token) cobre o caso de o cliente apresentar uma geração antiga: a sessão cai do mesmo jeito. |

### 5.5 Alterações em código existente (backend)

| Onde | O que mudou |
|---|---|
| `AuthService.login()` | Validava senha e devolvia 1 JWT. Continua validando senha (nada mudou nas checagens, inclusive a de conta federada sem senha); no final chama `refreshTokenService.issueSession(user)` e devolve o par. |
| `JwtAuthTokenService` | `expiresIn` deixou de ser `"1d"` fixo → `env.AUTH_ACCESS_TOKEN_TTL_SECONDS`. Verificação (`verify`) intocada. |
| `LoginUseCase` | Output: `{ token }` → `{ token, refreshToken }` (mudança aditiva — nada existente quebra). |
| `CompleteGovbrLoginUseCase` | O método privado `autenticar()` usa `issueSession`; `refreshToken` entrou no Output como `z.string().nullable()` — nulo nos desfechos `needs_*`, seguindo o padrão do `token` que já era assim. |
| `LinkGovbrToAccountUseCase` e `CompleteGovbrRegistrationUseCase` | Idem: `issueSession` + `refreshToken: z.string()` no Output (nesses dois o desfecho é sempre autenticado). |
| `authMiddleware` | **Zero mudança.** Continua validando só o JWT de acesso. |

### 5.6 Rotas novas (`presentation/orpc-routes/routes/`)

| Rota | Método/Path | Por que é pública |
|---|---|---|
| `identy.refreshSession` | `POST /auth/refresh` | Ela existe exatamente para quando o JWT já venceu — a credencial é o próprio refresh token, validado contra o banco. |
| `identy.logout` | `POST /auth/logout` | O cliente está descartando a própria sessão; exigir JWT válido impediria o logout de quem está com ele vencido. |

Ambas seguem o padrão canônico: `publicRoute` + `input/output` dos schemas
do use case + `orpcSafe` + `container.getXUseCase()`.

### 5.7 Container (`_di_container/container.ts`)

| Getter | Escopo |
|---|---|
| `getRefreshTokenRepository()` | Singleton lazy (padrão dos repos). |
| `getRefreshTokenService()` | Singleton lazy; injeta repo + userRepo + authTokenService + `env.AUTH_REFRESH_TOKEN_TTL_SECONDS`. |
| `getRefreshSessionUseCase()` / `getLogoutUseCase()` | Nova instância por chamada (padrão dos use cases). |
| `getAuthService()` e os 3 getters gov.br | Trocaram `getAuthTokenService()` por `getRefreshTokenService()` na injeção. |

### 5.8 Mobile — `locomotiva-api/session.ts`

| Função | O que faz |
|---|---|
| `salvarSessao(token, refreshToken)` | Grava o par no AsyncStorage (localStorage no web). |
| `limparSessao()` | Remove tudo da sessão do storage. |
| `renovarSessao()` | Troca o refresh token por um par novo chamando `identy.refreshSession` e regrava. Devolve o novo JWT, ou `null` quando a sessão realmente acabou — e nesse caso **já limpa o storage**, para não insistir num token morto a cada request. Dois cuidados: (1) **single-flight** — uma promise compartilhada em módulo faz N requests que tomaram 401 ao mesmo tempo dividirem UMA renovação; sem isso, como cada refresh token só vale uma vez (rotação), a segunda chamada derrubaria a sessão que a primeira acabou de renovar; (2) usa o `clientSemAuth`. |
| `clientSemAuth` | Um client oRPC "pelado", sem Bearer e sem o interceptador. Se o refresh usasse o link principal, um refresh que respondesse 401 dispararia outro refresh — loop infinito. |

### 5.9 Mobile — `locomotiva-api/link.ts`

| Função | O que faz |
|---|---|
| `fetchComRenovacao(request)` | O interceptador, plugado no `fetch` do `RPCLink`. Clona a request **antes** de enviar (body consumido não se lê duas vezes), envia; se a resposta NÃO é 401, devolve como veio; se é, chama `renovarSessao()` e repete a chamada UMA vez com o Bearer novo. Se a renovação falhar, devolve o 401 original — a sessão acabou e cabe às telas mandar a pessoa ao login. É esta função que torna a expiração do JWT **invisível** para o resto do app: nenhuma tela precisou mudar. |

### 5.10 Mobile — `contexts/auth-context.tsx`

| Função | O que mudou |
|---|---|
| `loginMutation.onSuccess` | Guarda o par via `salvarSessao` (antes guardava só o token). |
| `loginWithToken(token, refreshToken)` | Ganhou o 2º parâmetro — é o caminho do gov.br, que repassa o par emitido pela API. |
| `logout()` | Três atos, nesta ordem: (1) chama `identy.logout` com o refresh token — **revoga no servidor**; sem isso o "Sair" seria cosmético; em caso de falha de rede, segue mesmo assim (a sessão local morre agora, a do servidor expira sozinha); (2) `limparSessao()` + limpa caches; (3) redireciona pelo logout federado do gov.br — **sempre**, não importa como a pessoa entrou (antes era só para quem entrou via gov.br; o navegador pode carregar uma sessão gov.br de outro momento, e sem esta limpeza o próximo "Entrar com GOV.BR" cairia na conta antiga sem pedir senha). A chave `loginMethod`, que só existia para essa decisão, foi removida. |
| `checkToken` (boot) | Sem mudança de código — mas agora, se o JWT guardado venceu, o `getMe` dispara o interceptador, que renova e segue. É o que faz o app "abrir direto no perfil". |

### 5.11 Admin — `services/api.ts` e telas

O admin recebeu o mesmo mecanismo (sem ele, encurtar o JWT de 1 dia para
15 min **regrediria** a sessão do painel). `salvarSessao` / `limparSessao` /
`renovarSessao` / `fetchComRenovacao` são espelhos dos do mobile, sobre
localStorage. A função extra:

| Função | O que faz |
|---|---|
| `encerrarSessao()` | Revoga no servidor (best-effort) e limpa o storage. Usada em: `AdminLayout.handleLogout` (botão sair), `useLogin` (conta sem perfil admin — a sessão chegou a ser aberta no servidor, então revoga em vez de só esquecer; e no catch de erro) e `ProtectedRoute` (sessão derrubada por token inválido ou falta de permissão — revogação em segundo plano, a navegação não espera). |

---

## 6. Os fluxos, passo a passo

**Login (senha ou gov.br)** → use case chama `issueSession` → grava a linha
no banco (família nova) → cliente guarda o par → `getMe` popula o contexto.

**Request comum** → JWT no header → `authMiddleware` valida assinatura e
expiração → segue. O banco de sessões nem é consultado.

**JWT venceu (a cada ~15 min de uso)** → resposta 401 → `fetchComRenovacao`
chama `renovarSessao` (single-flight) → `rotate()` no servidor: consome o
token atomicamente, emite sucessor na mesma família com 30 dias contados
de agora → cliente regrava o par e repete a chamada original → a pessoa
não vê nada.

**Reabrir o app dias depois** → JWT guardado está vencido → mesmo fluxo
acima no primeiro `getMe` → abre direto no perfil.

**Sair** → revoga a família no servidor → limpa storage → encerra a sessão
gov.br no navegador. Qualquer refresh token daquela sessão, em qualquer
dispositivo que o tenha copiado, está morto.

**30 dias sem entrar** → `rotate()` falha (`expiresAt` no passado) →
`InvalidRefreshTokenError` → cliente limpa o storage → tela de login.

---

## 7. Segurança — o raciocínio de cada decisão

1. **Hash no banco:** o banco guarda sha256; quem rouba o banco não ganha
   sessões. Precedente no projeto: `ApiKey.keyHash`.
2. **Rotação a cada uso:** cada valor de refresh serve UMA vez. Um token
   interceptado que o titular já usou é inútil.
3. **Detecção de reuso:** se aparece um token com `usedAt` preenchido, duas
   partes têm o mesmo valor — o titular e, possivelmente, um ladrão. Como
   não dá para saber qual chegou primeiro, a família inteira cai e a pessoa
   refaz o login. Custo mínimo para o titular; prejuízo total para o ladrão.
4. **Consumo atômico:** a corrida entre dois refreshes simultâneos é
   decidida pelo Postgres num único `UPDATE`, não por lógica de aplicação.
5. **JWT curto:** o token que trafega em toda request — o mais exposto —
   vale 15 min. É o teto de vida útil de um vazamento dele.
6. **Logout revoga no servidor:** "Sair" mata a sessão de verdade, incluindo
   cópias do refresh token em outros lugares.
7. **Erro único (`InvalidRefreshTokenError`):** expirado, revogado, usado e
   inexistente respondem igual — não se confirma a um atacante o que ele
   tem em mãos.
8. **Client "pelado" para o refresh:** o interceptador nunca intercepta a
   própria renovação — sem loop possível.

---

## 8. Configuração e operação

```bash
# apps/api/.env — SEGUNDOS. Opcionais; os padrões já são os de produção.
AUTH_ACCESS_TOKEN_TTL_SECONDS=900        # 15 min (padrão)
AUTH_REFRESH_TOKEN_TTL_SECONDS=2592000   # 30 dias (padrão)
```

Trocar a duração da sessão é editar env e reiniciar — zero código. Para
homologar rápido, o `.env` local está com `120` / `1200` (2 min / 20 min):
dá para assistir a renovação e a expiração em uma sentada.

**Deploy:** aplicar `npx prisma migrate deploy` (cria `refresh_tokens`) —
lembrando que no Coolify a migração é manual. A mudança de contrato do
login é aditiva; clientes antigos continuam funcionando (só não renovam).

**Pendências deliberadas:** job de expurgo chamando `deleteExpired` (mesmo
estado dos repos gov.br); listagem de "sessões ativas" por usuário (a
estrutura com `familyId` já suporta, se um dia for pedido).

---

## 9. Roteiro de teste (com os TTLs de teste)

1. Login → usar o app → após 2+ min, navegar: funciona sem notar nada
   (no Network: um `refreshSession` antes da chamada repetida).
2. Fechar a aba, reabrir antes de 20 min parado → direto no perfil.
3. Ficar 20+ min sem mexer → reabrir → tela de login (sessão expirou).
4. "Sair" → linha ganha `revokedAt` no banco → reabrir → login; e
   "Entrar com GOV.BR" pede CPF/senha do zero (sessão gov.br também caiu).
