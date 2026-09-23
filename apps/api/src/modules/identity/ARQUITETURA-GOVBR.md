# Login Único gov.br — Arquitetura e Operação

> Documento de referência do que foi construído. Para o histórico da análise
> inicial e as decisões descartadas, ver `GOVBR-LOGIN-UNICO.md`.
>
> **Escopo:** app mobile (web) apenas. O painel administrativo continua com
> login por e-mail/CPF e senha, sem gov.br.
>
> **Estado em 2026-08-07: NÃO IMPLANTADO.** Verificado no `/spec.json` da API de
> dev: 78 rotas publicadas, nenhuma `/auth/govbr/*`. O deploy travou nas falhas
> de memória de 06/08 (ver seção 9.3). Tudo abaixo está no código e testado
> contra o banco, mas **nada disso está no ar** — inclusive o logout federado.

---

## 1. O que a integração faz

Permite que a pessoa entre no Locomotiva usando a conta gov.br dela, sem criar
mais uma senha. O gov.br confirma quem ela é; nós emitimos a nossa própria
sessão a partir disso.

**O que ganhamos:** identidade verificada pelo governo (CPF, nome e e-mail
confirmados na origem), e um cadastro de 2 campos em vez de 9.

**O que NÃO muda:** quem já usa senha continua usando. A federação é uma porta
adicional, não substituta.

### Protocolo

OpenID Connect sobre OAuth 2.0, fluxo *Authorization Code* com **PKCE (S256)**.
É o fluxo que o roteiro técnico do gov.br exige, e o adequado para aplicações
que têm servidor próprio — o `client_secret` nunca sai da API.

---

## 2. Peças e responsabilidades

### Backend (`apps/api`)

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Domínio (porta) | `domain/services/govbr-oidc.ts` | Contrato com o gov.br + tipo `GovbrIdentity` |
| Domínio (entidade) | `domain/entities/govbr-auth-request.ts` | Login em andamento: `state`, `nonce`, `code_verifier` |
| Domínio (entidade) | `domain/entities/govbr-pending-identity.ts` | Identidade validada aguardando 2º passo |
| Domínio (entidade) | `domain/entities/user.ts` | `createFederated()`, `linkGovbrIdentity()`, `hasLocalPassword()` |
| Infra | `infra/services/openid-govbr-oidc.ts` | PKCE, `/authorize`, `/token`, validação JWKS |
| Infra | `infra/repositories/prisma-govbr-*.ts` | Persistência, com consumo atômico |
| Aplicação | `application/use-cases/start-govbr-login.ts` | Inicia o fluxo |
| Aplicação | `application/use-cases/complete-govbr-login.ts` | Troca o código e decide o desfecho |
| Aplicação | `application/use-cases/link-govbr-to-account.ts` | Vincula conta existente (prova de senha) |
| Aplicação | `application/use-cases/complete-govbr-registration.ts` | Cria conta nova |
| Apresentação | `presentation/orpc-routes/routes/*govbr*.ts` | 6 rotas |

### Frontend (`apps/mobile`)

| Arquivo | Responsabilidade |
|---|---|
| `components/BotaoGovbr.tsx` | Botão "Entrar com GOV.BR"; some sozinho se a API disser que está desligado |
| `screens/public/GovbrCallbackScreen.tsx` | Recebe o retorno e conduz os 3 desfechos |
| `contexts/auth-context.tsx` | `loginWithToken()` e logout federado |
| `App.tsx` | Monta a tela de callback **antes** do React Navigation |

**Por que antes do React Navigation:** o `linking` do navegador tem prefixos
fixos (`locomotiva://`, um IP de rede local) que não cobrem o domínio de
produção. Ele descartaria a URL de retorno e voltaria para a tela inicial,
levando o `?code=` junto — foi exatamente o que aconteceu nos primeiros testes.

### Banco (3 migrações, todas aditivas)

```
20260805180000_govbr_login_unico        users: passwordHash vira opcional
                                        users: + authProvider, + govbrSub
20260805190000_govbr_auth_requests      tabela govbr_auth_requests
20260805200000_govbr_pending_identities tabela govbr_pending_identities
```

Script de reversão testado em `prisma/rollback/govbr-login-unico-rollback.sql`.

---

## 3. As 6 rotas

| Método | Caminho | Para quê |
|---|---|---|
| `GET` | `/auth/govbr/status` | O botão deve aparecer? |
| `POST` | `/auth/govbr/start` | Devolve a URL do gov.br |
| `POST` | `/auth/govbr/callback` | Troca o código; decide o desfecho |
| `POST` | `/auth/govbr/link` | Vincula conta existente (exige senha) |
| `POST` | `/auth/govbr/register` | Cria conta nova (exige data de nascimento) |
| `GET` | `/auth/govbr/logout-url` | URL do logout federado |

Todas públicas — quem chama ainda não tem sessão. A autorização vem do `code`
do gov.br e do `state`/`ticket` que só o nosso servidor emite.

---

## 4. Os fluxos, caso a caso

### Fluxo base (comum a todos)

```
 App                          API                        gov.br
  │                            │                            │
  │ 1. clica "Entrar com GOV.BR"                            │
  │───────────────────────────>│                            │
  │      POST /start           │ gera state, nonce, PKCE    │
  │                            │ grava govbr_auth_requests  │
  │<───────────────────────────│                            │
  │      { authorizationUrl }  │                            │
  │                            │                            │
  │ 2. navega o navegador inteiro para o gov.br ───────────>│
  │                            │            login + autorização
  │                            │                            │
  │ 3. volta em /auth/govbr/callback?code=..&state=.. <─────│
  │                            │                            │
  │ 4. lê code+state da URL, limpa a barra de endereço      │
  │───────────────────────────>│                            │
  │      POST /callback        │ consome o state (uso único)│
  │                            │ POST /token (Basic auth) ─>│
  │                            │<─ id_token ────────────────│
  │                            │ valida RS256/JWKS,         │
  │                            │ iss, aud, exp, nonce       │
  │                            │ resolve a conta            │
  │<───────────────────────────│                            │
  │   status: um dos 3 abaixo  │                            │
```

### Desfecho A — `authenticated`

**Quando:** o `sub` do gov.br já está vinculado a uma conta aqui.

É o caminho do dia a dia, a partir do 2º acesso. A API emite o JWT e a pessoa
entra direto. Nenhuma tela extra.

### Desfecho B — `needs_profile` (CPF novo)

**Quando:** ninguém no sistema tem esse CPF.

```
API devolve: { status: "needs_profile", ticket, name }
     │
     ▼
App mostra "Olá, <nome>! Falta pouco:"
  • Data de nascimento  (obrigatório)
  • Telefone            (obrigatório)
  • Empresa / Cargo     (opcionais)
     │
     ▼
POST /auth/govbr/register { ticket, birthDate, phone, ... }
     │
     ▼
Conta criada: authProvider=govbr, passwordHash=NULL, userType=USER
JWT emitido, pessoa entra
```

**Por que a data de nascimento é obrigatória:** o totem identifica a pessoa por
**CPF + data de nascimento** (`coworking/application/use-cases/checkin-by-cpf.ts`).
Sem ela, a conta nasceria sem conseguir fazer check-in. O gov.br não fornece
esse dado (ver seção 5).

### Desfecho C — `needs_password_link` (CPF já existe, com senha)

**Quando:** já existe conta com aquele CPF e ela tem senha.

```
API devolve: { status: "needs_password_link", ticket, maskedEmail }
     │
     ▼
App: "Você já tem uma conta aqui (e-mail g****a@dominio).
      Confirme a senha dessa conta para vinculá-la ao gov.br."
     │
     ▼
POST /auth/govbr/link { ticket, password }
     │
     ├── senha certa → vincula, MANTÉM a senha, emite JWT
     └── senha errada → INVALID_CREDENTIALS + ticket queimado
```

**Não é conta nova.** É a mesma conta ganhando uma segunda porta de entrada —
reservas, check-ins e pedidos de impressão continuam onde estavam.

**Por que exigir a senha:** o cadastro do sistema é aberto e não prova posse do
CPF. Sem essa confirmação, alguém que tivesse cadastrado o CPF de outra pessoa
antes receberia a sessão dela no primeiro login gov.br.

**Por que o ticket queima mesmo com senha errada:** impede tentar várias senhas
com um único login gov.br. Como a sessão no gov.br continua ativa, refazer são
dois cliques.

### Desfecho C' — CPF já existe, **sem** senha

Vincula automaticamente, sem perguntar nada. Não há dono a provar: uma conta
sem senha só pode ter sido criada pelo próprio fluxo federado.

### Conta híbrida (decisão de 2026-08-07)

Depois de vincular, a senha **permanece válida**. A pessoa escolhe: entra com
senha ou com gov.br.

Consequência desejada: um administrador pode vincular o gov.br para usar o app
e continuar entrando no painel com senha — o painel não aceita gov.br.

> Versão anterior anulava a senha ao vincular. Foi revisto: trancava o admin
> fora do próprio painel.

### Casos de erro

| Situação | Código | O que a pessoa vê |
|---|---|---|
| Cancelou no gov.br | `error=access_denied` na URL | "Você cancelou a autorização no gov.br." |
| `state` desconhecido, usado ou expirado | `GOVBR_INVALID_AUTH_REQUEST` | "Sessão de login expirada. Tente novamente." |
| Código inválido, assinatura ruim, nonce divergente | `GOVBR_AUTHENTICATION_FAILED` | "Falha na autenticação pelo gov.br." |
| Conta gov.br sem e-mail verificado | `GOVBR_EMAIL_UNAVAILABLE` | "Verifique seu e-mail em gov.br e tente novamente." |
| E-mail do gov.br pertence a outro cadastro | `GOVBR_EMAIL_ALREADY_IN_USE` | "Entre em contato com o suporte." |
| Integração desligada | `GOVBR_INTEGRATION_DISABLED` | Botão nem aparece |
| Conta de pessoa jurídica | `GOVBR_AUTHENTICATION_FAILED` | "Conta de pessoa jurídica não é aceita." |
| Tentou trocar senha em conta sem senha | `NO_LOCAL_PASSWORD` | "Esta conta acessa pelo gov.br." |

Os três casos de `state` inválido dão **o mesmo erro** de propósito: distinguir
"não existe" de "já foi usado" ajudaria alguém a sondar o fluxo.

---

## 5. O que dá para obter do gov.br

### Escopos liberados na nossa credencial

Descobertos empiricamente (o `/token` os lista na mensagem de `invalid_scope`):

```
openid  profile  email  phone  govbr_confiabilidades
govbr_confiabilidades_idtoken  govbr_empresa
```

**Em uso hoje:** `openid email profile`.

### Dados recebidos

Confirmados em login real contra homologação (2026-08-05):

| Dado | Claim | Observação |
|---|---|---|
| CPF | `preferred_username` | 11 dígitos, sem pontuação |
| Identificador | `sub` | Nesta credencial **é o CPF** (`subject_type: public`) |
| Nome completo | `name` | |
| Nome social | `social_name` | Só se existir no cadastro |
| E-mail | `email` + `email_verified` | **Não vem** se não verificado |
| Telefone | `phone_number` + `phone_number_verified` | Exige escopo `phone` |
| Foto | `picture` | URL; há também `/userinfo/picture` em base64 |
| Método de autenticação | `amr` | Ex.: `["mfa","otp"]` — dá para saber se usou 2FA |
| Nível de confiança | `reliability_info` | `bronze` / `silver` / `gold` (em inglês) |

### O que o gov.br NÃO fornece

**Data de nascimento.** Não existe em nenhum escopo — o catálogo de atributos é
fechado, e nenhuma tela de consentimento libera campos fora dele. Confirmado na
página *Escopos de Atributos*, no exemplo oficial do `/userinfo`, e em login
real.

O único caminho oficial para data de nascimento é o **Conecta gov.br / API
Consulta CPF (Serpro)** — produto separado, contratação à parte, voltado à
Administração Pública Federal direta. **Não recomendado:** consultar a base da
Receita para descobrir a data de nascimento de quem está logado na sua frente é
desproporcional quando basta perguntar.

### Armadilhas de formato (já tratadas no código)

1. **`email_verified` e `phone_number_verified` mudam de tipo:** boolean no
   `/userinfo`, string `"true"` no `id_token`. Comparar com `=== true` quebra o
   login na leitura das claims, com sintoma difícil de rastrear.
2. **`sub` pode vir formatado:** o exemplo oficial mostra `"123456789-00"` com
   hífen. Nesta credencial vem limpo, mas o código normaliza mesmo assim.
3. **`reliability_info.level` vem em inglês** (`gold`), não em português.

### Escopo `phone` está desativado

Pedi-lo faz o gov.br exigir telefone verificado, disparando validação por SMS
que **não é entregue em homologação** — trava o teste. O telefone é coletado no
"complete seu cadastro" de qualquer forma.

---

## 6. Tempo e sessão — as três camadas

Esta é a parte que mais confunde. **São três relógios independentes.**

```
┌──────────────────────────────────────────────────────────────┐
│ 1. SESSÃO NO GOV.BR         controlada por eles              │
│    Onde: cookie no domínio sso.acesso.gov.br                 │
│    Efeito: não pede senha de novo ao clicar "Entrar com"     │
│    Duração: NÃO documentada. Ordem de horas.                 │
├──────────────────────────────────────────────────────────────┤
│ 2. NOSSA SESSÃO (JWT)       controlada por nós               │
│    Onde: AsyncStorage/localStorage do app                    │
│    Efeito: mantém a pessoa logada no Locomotiva              │
│    Duração: 1 DIA  (jwt-auth-token.ts:17)                    │
├──────────────────────────────────────────────────────────────┤
│ 3. ARTEFATOS DO FLUXO       curtíssimos, descartáveis        │
│    state (govbr_auth_requests):     10 min, uso único        │
│    ticket (govbr_pending_identities): 10 min, uso único      │
└──────────────────────────────────────────────────────────────┘
```

### Respondendo diretamente

**"Quanto tempo consigo entrar via gov.br sem digitar senha?"**
Enquanto a sessão **no gov.br** (camada 1) durar. A duração não é documentada e
não a medimos — é cookie no domínio deles, e não tem relação com o nosso JWT.

Mas a pergunta certa não é *"quanto dura?"* e sim *"queremos aceitá-la?"*. Dá
para recusar a sessão existente com `prompt=login` (ver abaixo) — aí a duração
deixa de importar.

**"Tem relação com o nosso JWT?"**
**Não.** São independentes:

- Nosso JWT expira em 1 dia → a pessoa precisa entrar de novo **no Locomotiva**.
  Se a sessão gov.br ainda estiver viva, esse "entrar de novo" é um clique sem
  senha.
- Sessão gov.br expira → o próximo clique pede senha lá, mas se o nosso JWT
  ainda for válido, a pessoa nem precisa clicar.

**"E se outra pessoa usar o mesmo navegador?"**
Entraria como a anterior — natureza de qualquer SSO (o mesmo acontece com o
Gmail deixado aberto). É por isso que existe o logout federado.

### Logout federado

```
Pessoa clica "Sair"
     │
     ├── entrou por SENHA  → apaga o token local. Fim.
     │
     └── entrou por GOV.BR → apaga o token local
                           + redireciona para o /logout do gov.br
                           → na próxima vez, pede senha de novo
```

O app registra como a pessoa entrou (`loginMethod` no AsyncStorage) para
distinguir os dois casos.

### Controlar a sessão do gov.br em vez de sofrer com ela

O logout federado só age quando a pessoa clica em "Sair". Se ela apenas fechar a
aba, a sessão no gov.br continua — e o próximo acesso entra sem senha.

Para isso o OpenID Connect Core define dois parâmetros no `/authorize`, e **quem
controla somos nós**:

| Parâmetro | Efeito | Configuração |
|---|---|---|
| `prompt=login` | Recusa a sessão existente: **sempre** pede autenticação | `GOVBR_PROMPT=login` |
| `max_age=N` | Aceita a sessão só se autenticou há menos de N segundos | `GOVBR_MAX_AGE=900` |
| *(nenhum)* | Aceita qualquer sessão viva — comportamento atual | não definir |

⚠️ **Suporte não confirmado.** O discovery do gov.br não declara
`prompt_values_supported` — mas ele também omite `code_challenge_methods_supported`
(com o PKCE sendo obrigatório) e `end_session_endpoint` (com o `/logout`
existindo), então ausência no discovery não é prova de nada nesse provedor.
**Confirme por teste** antes de depender: monte duas URLs de `/authorize`
idênticas, uma com `prompt=login`, e abra as duas com sessão gov.br ativa. Se a
segunda pedir senha, é suportado.

**Recomendação:** `GOVBR_PROMPT=login` para totem e computador compartilhado;
`GOVBR_MAX_AGE` para uso pessoal, onde pedir senha a cada acesso incomoda mais
do que protege.

⚠️ **Sair do gov.br é global:** a pessoa também é deslogada de outros serviços
gov.br naquele navegador. É o comportamento padrão — e é o que protege o
computador compartilhado.

### Limitação conhecida

Nosso JWT **não tem invalidação server-side**. Um token emitido continua válido
pelo dia inteiro, mesmo depois do logout. Para um logout realmente completo,
seria preciso uma coluna `sessionsValidFrom` no usuário, conferida na
verificação do token. **Não implementado** — está registrado como pendência.

---

## 7. Segurança — o que está implementado

| Proteção | Como | Onde |
|---|---|---|
| **CSRF** | `state` aleatório (UUID v4, CSPRNG), conferido no retorno | `govbr-auth-request.ts` |
| **Replay de código** | `state` consumido **atomicamente** no `UPDATE` | `prisma-govbr-auth-request.ts` |
| **Replay de token** | `nonce` conferido contra o claim do `id_token` | `openid-govbr-oidc.ts` |
| **Interceptação do código** | PKCE S256; `code_verifier` só no servidor | `openid-govbr-oidc.ts` |
| **Token forjado** | Assinatura RS256/RS512 via JWKS + `iss`, `aud`, `exp` | `openid-govbr-oidc.ts` |
| **Roubo de conta por CPF** | Prova de posse (senha) antes de vincular | `link-govbr-to-account.ts` |
| **Força bruta de senha** | Ticket queima na primeira tentativa | `link-govbr-to-account.ts` |
| **Escalada de privilégio** | `createFederated` fixa `userType=USER` | `user.ts` |
| **Open redirect** | `redirectTo` só aceita caminho relativo | `start-govbr-login.ts` |
| **Vazamento de segredo** | `client_secret` só no servidor; tokens gov.br descartados | — |
| **Enumeração de contas** | Erros indistinguíveis para casos diferentes | vários |
| **Porta lateral por senha** | "Esqueci a senha" bloqueado em conta sem senha | `password.ts` |

### Detalhe do consumo atômico

As condições ficam dentro do próprio `UPDATE`:

```sql
UPDATE govbr_auth_requests
   SET usedAt = agora
 WHERE state = ? AND usedAt IS NULL AND expiresAt > agora
```

Escrito como "ler, checar, gravar" — o jeito natural — cinco requisições
simultâneas leriam `usedAt = null` antes de qualquer uma gravar, e todas
passariam. Testado: 5 simultâneas, **1 vence**.

### Pendências de segurança (não implementadas)

| Item | Risco | Prioridade |
|---|---|---|
| Invalidação server-side de sessão (`sessionsValidFrom`) | Logout não revoga o JWT | Alta |
| Rate limit em `/auth/govbr/start` | Rota pública que grava no banco | Média |
| Contador de tentativas no reset por código | 10⁶ combinações sem limite | Alta |
| Trilha de auditoria de vinculação | Sem como investigar um incidente | Média |
| E-mail ao vincular identidade | Vítima não fica sabendo | Média |
| Expurgo periódico das tabelas temporárias | Retenção indefinida (LGPD) | Baixa |
| CORS restrito (hoje `*`) | Anterior à integração | Baixa |

---

## 8. Configuração

### Variáveis (API)

| Variável | Obrigatória | Exemplo |
|---|---|---|
| `GOVBR_ENABLED` | não (padrão `false`) | `true` |
| `GOVBR_CLIENT_ID` | para funcionar | `h-locomotiva-dev.inova.ma.gov.br` |
| `GOVBR_CLIENT_SECRET` | para funcionar | *(segredo)* |
| `GOVBR_ISSUER` | não (padrão staging) | `https://sso.acesso.gov.br` |
| `GOVBR_REDIRECT_URI` | para funcionar | `https://.../auth/govbr/callback` |
| `GOVBR_SCOPES` | não | `openid email profile` |
| `GOVBR_POST_LOGOUT_REDIRECT_URI` | não | `https://locomotiva.inova.ma.gov.br/` |
| `GOVBR_PROMPT` | não | `login` (ver seção 6) |
| `GOVBR_MAX_AGE` | não | `900` (ver seção 6) |

**Todas opcionais no schema de propósito.** O `env.ts` é `.parse()`ado no boot —
torná-las obrigatórias derrubaria a API inteira em qualquer ambiente sem
credencial. Quem exige é o construtor do serviço, instanciado sob demanda.

O app mobile **não precisa de variável nenhuma**: pergunta à API se o botão deve
aparecer. Ligar e desligar acontece em um lugar só, sem redeploy do app.

### A chave geral (`GOVBR_ENABLED`)

Desligar derruba **as quatro rotas do fluxo**, não só o botão — quem souber o
endereço continuaria chamando direto se a verificação ficasse no cliente.
Testado nos dois estados.

---

## 9. Colocar em produção

### 9.1 Solicitar à SGD

A credencial atual é **de homologação** (prefixo `h-`). Produção é outro par de
`client_id` e `client_secret`.

**Pedidos a fazer no mesmo canal que enviou as credenciais de teste:**

1. **Credenciais de produção**, informando as URLs:
   - Redirecionamento: `https://locomotiva.inova.ma.gov.br/auth/govbr/callback`
   - Log Out: `https://locomotiva.inova.ma.gov.br/`

2. **Cadastro da URL de Log Out em homologação** — hoje só a de redirecionamento
   está cadastrada. Sem ela o logout funciona, mas a pessoa para numa página de
   erro em vez de voltar ao app.

3. **Confirmar o `subject_type` da credencial de produção.** O discovery permite
   `public` e `pairwise`. Em homologação é `public` (o `sub` é o CPF). Se em
   produção vier `pairwise`, o `sub` passa a ser um pseudônimo por aplicação e a
   estratégia de vínculo muda.

4. **Liberação de firewall:** informar o IP de saída do servidor. O gov.br
   bloqueia IPs não cadastrados em produção (erro `Connection reset by peer`).

5. *(opcional)* **Validar o botão:** perguntar se uma reprodução visual fiel do
   componente `br-sign-in` é aceita para React Native, já que Web Components não
   rodam nesse ambiente.

### 9.2 Requisitos que já cumprimos

| Requisito | Situação |
|---|---|
| Domínio oficial de governo (Portaria SGD/MGI 7.076/2024) | ✅ `inova.ma.gov.br` |
| HTTPS em todas as URLs | ✅ |
| Botão "Entrar com GOV.BR" conforme Design System | ⚠️ Reprodução fiel (cor, formato pílula, altura, peso) |
| PKCE S256 | ✅ |
| Validação de `state` e `nonce` | ✅ |
| Validação de assinatura via JWKS | ✅ |
| Logout federado | ✅ |

### 9.3 Checklist de deploy

**Antes:**
- [ ] Credenciais de produção em mãos
- [ ] `redirect_uri` de produção cadastrada e conferida **caractere a caractere**
- [ ] IP de saída liberado no firewall do gov.br
- [ ] Variáveis no Coolify de produção, com `GOVBR_ENABLED=false`
- [ ] Vídeo de homologação aprovado pela SGD

**Deploy:**
- [ ] Migrações aplicadas (`start:api` já roda `prisma migrate deploy`)
- [ ] Subir com a chave **desligada** e confirmar que nada quebrou no que já
      funcionava (login, cadastro, check-in, reservas)
- [ ] Só então `GOVBR_ENABLED=true` e reiniciar

> A separação importa: quebrou com a chave desligada, o problema é a migração ou
> o código base. Quebrou depois de ligar, é a integração. Você sabe onde olhar
> sem adivinhar.

**Um deploy por vez.** O `tsc` da API consome ~2 GB de pico; dois builds
simultâneos esgotaram a memória da VPS e derrubaram todos os domínios em
2026-08-06. Adicionar swap resolve a causa raiz.

### 9.4 Reverter

Redeploy do commit anterior — **sem tocar no banco**. O código antigo lê
`passwordHash` como texto obrigatório e ignora as colunas novas; como só o
código novo cria conta sem senha, nada gera nulo enquanto o antigo roda.

Reverter o schema é possível (`prisma/rollback/`, testado ida e volta) mas só
sai limpo enquanto **nenhuma conta federada existir** — o `SET NOT NULL` falha,
de propósito, se houver senha nula.

---

## 10. Pendências

### Funcionalidade
- [ ] "Criar senha" no perfil, para quem entrou pelo gov.br poder também usar senha
- [ ] Usar `redirectTo` para levar a pessoa à tela pretendida após o login
- [ ] Foto do gov.br (`picture`) no perfil
- [ ] Escopo `phone` em produção (SMS funciona lá)

### Segurança
- [ ] Invalidação server-side de sessão (ver seção 7)
- [ ] Rate limit e contador de tentativas
- [ ] Auditoria e notificação de vinculação

### Operação
- [ ] **Subir a integração em dev** — nunca chegou a implantar (ver topo)
- [ ] Testar `prompt=login` / `max_age` contra o gov.br (seção 6)
- [ ] Swap na VPS
- [ ] Expurgo periódico das tabelas temporárias
- [ ] Desacoplar o build do admin do `build:api` (economiza ~2 GB por deploy)

---

## 11. Como testar sem interface

Dois scripts, ambos contra homologação:

```bash
cd apps/api

# handshake completo: gera o link, você loga, cola a URL de volta
npx tsx scripts/govbr-handshake.ts
npx tsx scripts/govbr-handshake.ts --retorno "<URL com ?code=>"

# descobrir qual redirect_uri está cadastrada
npx tsx scripts/govbr-descobrir-redirect.ts
```

A saída do handshake vem **mascarada** por padrão (CPF, nome, e-mail) — pode ser
colada em conversa. `--cru` mostra os valores reais.

**Validar credenciais sem navegador:** um `POST /token` com
`grant_type=client_credentials` distingue os casos — credencial correta devolve
`400 invalid_scope` (autenticou, recusou o escopo); adulterada devolve
`401 Bad credentials`.
