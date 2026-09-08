# Deeplink e login gov.br no app (web, Android e iOS)

Plano por fases para o mesmo código Expo rodar como site (como hoje) e como
aplicativo de loja, com o login gov.br funcionando nos três, e com links do site
abrindo o app quando ele estiver instalado. Cada fase termina num teste prático.

Pedido do Rodrigo (01/09/2026): "ver a questão do deeplink" usando o domínio
reverso `br.gov.ma.inova.locomotiva-mobile`, deixando o app preparado para o
retorno do login gov.br quando virar app de loja.

Contexto já apurado: `apps/api/src/modules/identity/GOVBR-LOGIN-UNICO.md`
(credencial de homologação, domínios) e `SESSAO-PERSISTENTE.md` (refresh token).

## Status

| Fase | Situação (02/09/2026) |
|---|---|
| 0 | **Concluída em 03/09.** Build de dev Android (EAS `54fe3324`) instalado num Galaxy S24+; login por senha e telas normais ok; o link do app abre a tela de callback (a 1ª tentativa de build quebrou no `@react-native-community/masked-view`, trocado pelo `@react-native-masked-view/masked-view`). |
| 1 | Código pronto na API e no mobile, typecheck ok. No celular já foi provado: app abre o navegador do sistema, chega ao gov.br e volta ao domínio; e o link do app entrega `code`/`state` à tela de callback. Falta o deploy em `dev` (página de ponte) para o ciclo completo. Logout passou a ser só local, por decisão de produto (03/09). |
| 2–4 | Não iniciadas. |

Onde está o código da fase 1: `apps/mobile/src/govbr/link.ts` (link do app,
leitura do retorno, marcador no `state`), `BotaoGovbr.tsx`, `App.tsx`,
`GovbrCallbackScreen.tsx`, `auth-context.tsx`; na API,
`identity/domain/entities/govbr-auth-request.ts` (sufixo `.app` no `state`) e
`start-govbr-login.ts` (campo `client`).

Detalhe do development build: o evento de URL com o app aberto só chegou pelo
canal do React Native (`Linking.addEventListener('url')`); o `useLinkingURL`
do expo-linking sozinho não disparou. Por isso `govbr/link.ts` escuta os dois.
E `console.log` não aparece mais no `adb logcat` (RN ≥ 0.77): use o terminal
do Metro ou `adb exec-out screencap` para ver a tela.

Detalhe de build: o typecheck do mobile lê os tipos da API pelo `dist/`
(project references do tsconfig). Depois de mudar um schema na API, rodar
`npm run build` em `apps/api` antes do `npm run typecheck` do mobile.

---

## A ideia central: o retorno do gov.br em cada plataforma

O gov.br exige HTTPS em toda a comunicação e só devolve a pessoa para a URL
cadastrada na credencial. Hoje ela é
`https://locomotiva-dev.inova.ma.gov.br/auth/govbr/callback` (dev) e será
`https://locomotiva.inova.ma.gov.br/auth/govbr/callback` (prod). **Isso não
muda.** O que muda é o que a página de callback faz ao receber o código.

| Plataforma | Caminho | Quem troca o código pela sessão |
|---|---|---|
| Web | site → gov.br → `/auth/govbr/callback` | a própria página (igual hoje) |
| App (Android/iOS) | app → navegador do sistema → gov.br → `/auth/govbr/callback` → **link do app** `br.gov.ma.inova.locomotiva://auth/govbr/callback?code=…&state=…` | o app, ao receber o link |

A página de callback, quando percebe que o login foi iniciado pelo app, não
troca o código: ela "passa o bastão" redirecionando para o link do app. O
navegador de login (Custom Tab no Android, ASWebAuthenticationSession no iOS)
fecha sozinho quando chega nesse link, e o app volta para frente já com o código.

Isso é o que dá para fazer sem depender de ninguém. A verificação de domínio
(fase 2) é o passo seguinte, que faz a própria URL `https://` abrir o app.

### O que a documentação do gov.br diz (acesso.gov.br/roteiro-tecnico)

- "Todo o canal de comunicação deve ser realizado com o protocolo HTTPS."
- Não há nenhuma menção a aplicativo móvel, deep link ou esquema `app://`.
- URL não cadastrada dá `invalid_grant`; a inclusão de URL é pedida pelo
  Portal do Serviço de Integração (aba "Enviar dados/dúvidas"), prazo de 3 dias.
- Recomenda não usar WebView no celular (usamos o navegador do sistema).

---

## Decisões para fechar com o Rodrigo antes de começar

1. **Identificador do app.** O Android não aceita hífen no package name e o
   iOS não aceita underscore no bundle ID. Sem separador serve para os dois e
   também como scheme do link:

   | Uso | Valor proposto |
   |---|---|
   | `android.package` | `br.gov.ma.inova.locomotiva` |
   | `ios.bundleIdentifier` | `br.gov.ma.inova.locomotiva` |
   | `scheme` (link do app) | `br.gov.ma.inova.locomotiva://` |

   Alternativa se ele fizer questão do "mobile": `br.gov.ma.inova.locomotivamobile`.
   Vira definitivo no primeiro envio para a loja.

2. **Contas.** Expo (grátis), Google Play Console (taxa única) e Apple
   Developer Program (anual). A da Apple é necessária para testar em iPhone
   físico e para Universal Links. Devem ficar no nome da instituição.

3. **Escopo do deeplink.** Só o retorno do gov.br agora; sala/reserva/notificação
   ficam para a fase 4.

---

## Fase 0 — Identidade do app e build de desenvolvimento

**Objetivo:** ter o app instalado no seu celular, com o identificador certo,
respondendo ao link do app. Sem gov.br ainda.

**Entregas**

- `app.json`: `scheme`, `android.package`, `ios.bundleIdentifier`.
- Pacotes: `npx expo install expo-dev-client expo-linking expo-web-browser`.
- EAS: `eas login` e `eas build:configure` (gera `eas.json` com perfis
  development / preview / production).
- Build: `eas build --profile development --platform android` e instalar o APK
  pelo QR code.
- `.env` do mobile com `EXPO_PUBLIC_API_URL` alcançável do celular (API dev
  publicada ou IP do Mac na rede, como no `.env.exemple`).
- Rodar `npx expo start --dev-client`; o celular carrega o código do Mac com
  hot reload. Só precisa de novo build quando mudar `app.json` ou adicionar
  pacote nativo.

**Teste na prática**

- App abre no celular, login por senha funciona, telas normais funcionam
  (aqui já dá para validar "as outras funcionalidades" no aparelho).
- `npx uri-scheme open "br.gov.ma.inova.locomotiva://auth/govbr/callback?code=teste&state=teste" --android`
  traz o app para frente (o tratamento do link vem na fase 1).
- `npm run web` continua igual.
- Opcional: `eas build --profile development --platform ios` com
  `"simulator": true` no perfil, para rodar no simulador do Mac.

**Depende de:** só de você. Não precisa de deploy.

---

## Fase 1 — O login gov.br sai do app e volta para o app

**Objetivo:** no celular, apertar "Entrar com gov.br", autenticar no navegador
do sistema e voltar para o app logado. Na web, nada muda.

**Entregas na API (`identity`)**

- `startGovbrLogin` ganha `client: 'web' | 'app'` (padrão `web`), guardado no
  `GovbrAuthRequest`. Quando `app`, o `state` gerado leva um marcador (ex.:
  sufixo), para a página de callback saber sem consultar a API.

**Entregas no mobile**

- `GovbrCallbackScreen` deixa de ler `window.location` e recebe
  `code`/`state`/`error` por props.
- `App.tsx`: na web, extrai da URL como hoje; no nativo, escuta a URL de
  entrada com `expo-linking` (`useURL` / `getInitialURL`) para o caso de o app
  ter sido fechado enquanto a pessoa estava no navegador.
- `BotaoGovbr`: na web `window.location.assign`; no nativo
  `WebBrowser.openAuthSessionAsync(authorizationUrl, 'br.gov.ma.inova.locomotiva://auth/govbr/callback')`.
  O resultado traz a URL com `code`/`state`, que alimenta a `GovbrCallbackScreen`.
- Página de callback (na web) com marcador de app: não troca o código. Mostra
  "Voltando para o aplicativo…", redireciona para o link do app com os mesmos
  parâmetros e exibe um botão "Abrir o aplicativo" (o Chrome do Android pode
  bloquear redirecionamento automático para scheme sem um toque).
- Logout: na web como hoje; no nativo abre a URL de logout do gov.br numa
  sessão de navegador que fecha ao voltar (a página pós-logout usa a mesma
  ponte). Detalhar na implementação.

**Deploy necessário para testar:** API e web na branch `dev` (Coolify). O
gov.br só devolve para o domínio cadastrado (`locomotiva-dev`), então a página
de callback nova precisa estar publicada lá. O app dev no celular aponta para
a API dev.

**Teste na prática**

- Web (dev): login gov.br igual a hoje, inclusive "complete seu cadastro" e
  vínculo por senha.
- Celular: botão gov.br → navegador do sistema → login → "Voltando para o
  aplicativo" → app aberto e logado.
- Celular, app fechado à força durante o login: ao voltar pelo link, o app
  abre do zero e conclui o login.
- Celular, cancelar no gov.br: erro `access_denied` tratado na tela.
- Fechar e reabrir o app: continua logado (refresh token).
- iOS no simulador: mesmo fluxo (o scheme funciona no simulador).

**Cuidados:** o código do gov.br é de uso único, a página nunca pode recarregar
antes de repassar. A `redirect_uri` tem que ser idêntica à cadastrada, então
não dá para pendurar parâmetro nela; por isso o marcador vai no `state`.

---

## Fase 2 — Links do site abrem o app (App Links / Universal Links)

**Objetivo:** `https://locomotiva.inova.ma.gov.br/...` abre o app quando
instalado. É o "processo de DNS" que o Rodrigo citou: publicar no domínio um
arquivo dizendo "este site autoriza o app tal a abrir seus links".

**Entregas**

- `app.json`:
  - `android.intentFilters` com `autoVerify: true` para os hosts
    `locomotiva-dev.inova.ma.gov.br` e `locomotiva.inova.ma.gov.br`.
  - `ios.associatedDomains`: `applinks:locomotiva.inova.ma.gov.br` e
    `applinks:locomotiva-dev.inova.ma.gov.br`.
- Arquivos em `apps/mobile/public/.well-known/` (o `expo export --platform web`
  copia `public/` para `dist/`):
  - `assetlinks.json`: package + SHA-256 do certificado de assinatura
    (`eas credentials -p android` mostra).
  - `apple-app-site-association`: Team ID da Apple + bundle ID.
- Servidor web (Coolify) entregando os dois com `Content-Type: application/json`,
  sem redirecionamento, em HTTPS.
- Novo build dev (mudou o `app.json`).

**Depende de:** Apple Developer Program (Team ID) para o iOS. No Android, só
do keystore que o EAS já gera. E de quem administra o Coolify, se o
content-type precisar de ajuste.

**Teste na prática**

- Android: `adb shell pm get-app-links br.gov.ma.inova.locomotiva` mostra
  `verified`; enviar o link https para si mesmo (WhatsApp, e-mail) e tocar →
  abre o app. Conferência: https://developers.google.com/digital-asset-links/tools/generator
- iOS: tocar no link no app Notas ou Mensagens → abre o app. Conferir o
  arquivo em `https://app-site-association.cdn-apple.com/a/v1/locomotiva-dev.inova.ma.gov.br`.
- Fluxo gov.br continua funcionando pela ponte da fase 1. A ponte fica como
  caminho garantido; se o link verificado disparar antes dela, melhor ainda.

**Notas:** Android 12+ não abre app por link https sem verificação. iOS exige o
arquivo da Apple, não tem como "forçar na mão".

---

## Fase 3 — Produção e lojas

**Entregas**

- Credencial de produção do gov.br (mesmo processo, ~3 dias):
  `https://locomotiva.inova.ma.gov.br/auth/govbr/callback`. Nada de scheme no ofício.
- `.well-known` também no domínio de produção.
- `eas.json` perfil `production`; `eas build --profile production` (AAB para
  Play Store, IPA para App Store); `eas submit`.
- Contas Play Console e App Store Connect no nome da instituição.
- Pendências herdadas da sessão persistente: tirar os TTLs de teste do `.env`
  da API e rodar `prisma migrate deploy` da migration `20260831120000_refresh_tokens`.
- Trilhas de teste antes de publicar: "teste interno" no Play e TestFlight no iOS.

**Teste na prática:** mesmo roteiro das fases 1 e 2, com a credencial de
produção, nos apps de loja.

**Lembrete:** o identificador vira definitivo no primeiro envio para a loja.

---

## Fase 4 (depois) — Deeplinks além do login

- `linking` do React Navigation com `prefixes` = scheme + os dois domínios
  https, para link de sala/reserva abrir a tela certa.
- Notificações push abrindo telas.
- Hoje o `App.tsx` trata o callback fora do Navigation por causa dos prefixos
  fixos; nessa fase isso se unifica.

---

## Matriz de testes

| Fase | Onde | O que provar | Como |
|---|---|---|---|
| 0 | Celular Android (build dev) | App instalado com identificador certo, funcionalidades normais | Abrir, logar por senha, navegar |
| 0 | Celular Android | Responde ao link do app | `npx uri-scheme open "br.gov.ma.inova.locomotiva://x" --android` |
| 0 | Web | Nada regrediu | `npm run web` |
| 1 | Web (dev publicada) | gov.br igual a hoje | Login, completar cadastro, vínculo por senha |
| 1 | Celular Android | Sai pro navegador, volta logado | Botão gov.br |
| 1 | Celular Android | Volta com o app fechado | Forçar fechar durante o login |
| 1 | Celular Android | Cancelamento tratado | Cancelar no gov.br |
| 1 | Simulador iOS | Mesmo fluxo | Botão gov.br |
| 2 | Celular Android | Link https abre o app | `pm get-app-links`, tocar no link |
| 2 | iPhone físico | Link https abre o app | Tocar no link no Notas |
| 3 | Play "teste interno" / TestFlight | Tudo acima com credencial de produção | Roteiro completo |

---

## Glossário curto

- **Link do app (scheme):** `br.gov.ma.inova.locomotiva://…`. Só o app entende.
  Declarado no `app.json`, sem depender de ninguém.
- **App Links (Android) / Universal Links (iOS):** URL `https://` normal que
  abre o app se ele estiver instalado. Exige arquivo de verificação no domínio.
- **Development build:** um app de verdade com o seu código e o seu
  identificador, gerado pelo EAS. O Expo Go não serve para deeplink porque não
  tem o seu package name nem o seu scheme.
- **EAS:** serviço de build da Expo (nuvem). O `eas-cli` já está instalado.

---

## Checklist: subir na `dev` e testar a fase 1 (08/09/2026)

A `dev` está sem os commits desta branch desde o Login Gov (inclui a sessão
persistente). Depois do merge, três coisas não acontecem sozinhas:

**1. Migrations no banco de dev.** O deploy do Coolify só roda `npm start`;
nenhuma migration é aplicada. Faltam quatro na dev:
`20260805180000_govbr_login_unico`, `20260805190000_govbr_auth_requests`,
`20260805200000_govbr_pending_identities`, `20260831120000_refresh_tokens`.
Aplicar com `npm run prisma:deploy` (= `prisma migrate deploy`) apontando para
o `DATABASE_URL` da dev — pelo terminal do container da API no Coolify, ou
localmente com `DATABASE_URL=<url da dev> npx prisma migrate deploy` em
`apps/api`. Sem isso, login por senha quebra (tabela `refresh_tokens`) e o
gov.br quebra (tabelas `govbr_*`).

**2. Variáveis da API dev (Coolify, `locomotiva-api-dev`).** Copiar do `.env`
local, que já aponta para a credencial de homologação e para a URL de retorno
da dev:

| Variável | Valor |
|---|---|
| `GOVBR_ENABLED` | `true` |
| `GOVBR_CLIENT_ID` | `h-locomotiva-dev.inova.ma.gov.br` |
| `GOVBR_CLIENT_SECRET` | o segredo da credencial de homologação (sem espaço no fim) |
| `GOVBR_ISSUER` | `https://sso.staging.acesso.gov.br` |
| `GOVBR_REDIRECT_URI` | `https://locomotiva-dev.inova.ma.gov.br/auth/govbr/callback` |
| `GOVBR_SCOPES` | o mesmo do `.env` local |
| `GOVBR_POST_LOGOUT_REDIRECT_URI`, `GOVBR_PROMPT`, `GOVBR_MAX_AGE` | deixar sem definir |
| `AUTH_ACCESS_TOKEN_TTL_SECONDS`, `AUTH_REFRESH_TOKEN_TTL_SECONDS` | deixar sem definir (padrões 15 min / 30 dias) |

Web (`locomotiva-dev`) e admin não ganharam variável nova.

**3. Testar.**

Na web, em `https://locomotiva-dev.inova.ma.gov.br`:
- Login por senha → fechar a aba → abrir de novo → continua logado.
- "Entrar com gov.br" → CPF/senha no gov.br → volta logado. Se for CPF novo,
  aparece "complete seu cadastro"; se o CPF já tem conta, pede a senha dela.
- Sair → volta à tela inicial.

No celular (build de dev já instalada):
- No `.env` do mobile, trocar para `EXPO_PUBLIC_API_URL=https://locomotiva-api-dev.inova.ma.gov.br/api`
  e reiniciar `npx expo start --dev-client`.
- "Entrar com gov.br" → navegador do sistema → gov.br → página
  "Voltando para o aplicativo…" no site dev → app volta logado. Se o Chrome
  não abrir o app sozinho, o botão "Abrir o aplicativo" faz isso.
- Repetir cancelando no gov.br (mensagem de cancelamento na tela).
- Repetir fechando o app à força enquanto está no gov.br: ao voltar, o app
  abre e conclui o login.
- Fechar e reabrir o app: continua logado. Sair: volta à tela inicial.

Passando tudo isso, a fase 1 está fechada.
