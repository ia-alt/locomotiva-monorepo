# Design system "Plataforma"

Identidade visual do app do Locomotiva Hub. O hub funciona na antiga Estação
Ferroviária João Pessoa (1929), e a linguagem vem daí: chão de plataforma,
bilhetes com canhoto, painel de horários com letras que viram, sinais de trem e
a faixa amarela de segurança.

Tudo o que é visual e reaproveitável mora nesta pasta. Os componentes daqui não
conhecem API nem regra de negócio: recebem tudo por props. O que junta dados e
visual (um bilhete de reserva, o painel do início) fica em
`src/components/<area>/`. As telas ficam curtas e só montam esses componentes.

## Regras

1. **Nada de cor, fonte ou tamanho solto nas telas.** Cores vêm de `cores`,
   fontes e tamanhos de texto vêm de `<Texto variante="...">`, espaçamentos de
   `espaco` e cantos de `raio`. Mudou a identidade? Muda aqui, e o app inteiro segue.
2. **Texto sempre com `Texto`** (não use o `Text` do react-native nem o do
   Paper). Escolha a variante pelo papel: `titulo` (título de tela),
   `secao` (título de seção), `corpo`, `explicacao` (frase que explica uma
   ação), `apoio` (informação secundária), `rotulo` (legendas pequenas),
   `destaque` / `destaqueMedio` (nome de item em lista), `mono` (datas e
   horários no estilo bilhete, em maiúsculas).
3. **Ícones sempre com `Icone`**, pelo nome em português (`nome="calendario"`).
   Falta um desenho? Acrescente em `Icone.tsx` (Feather primeiro).
4. **Situação (status) sempre com `SinalComRotulo`.** Verde = confirmado ou
   pode seguir; amarelo = aguardando; vermelho = recusado ou cancelado;
   apagado = já passou. O texto vai sempre junto da cor.
5. **Formulários com `Campo`** (rótulo em cima, erro embaixo), ligado ao
   `Controller` do react-hook-form como antes. Botões com `Botao`
   (`primario` para a ação principal da tela, uma por tela; `contorno` para o
   resto; `perigo` para ações destrutivas, como sair ou cancelar). Botões são
   pílula, como o do gov.br, que é pílula por regra do governo. Setas de
   "Avançar" vão no fim (`icone="seguir" iconeNoFim`). O botão "Entrar com GOV.BR" é o `BotaoGovbrPilula` e não muda de
   visual: é regra da homologação do gov.br.
6. **Toque mínimo de 44 px** e contraste AA (as cores do tema já passam).
7. Sem emoji, sem degradê, sem sombra forte. Superfícies brancas (`papel`)
   sobre o chão (`chao`); o escuro (`painel`) só para o painel de horários e
   o passe do perfil.

## Como montar uma tela

- **Fundo:** `cores.chao`. As faixas do sistema (barra de status e de gestos)
  já saem na cor certa pela `MolduraSegura` (`contexts/layout-context.tsx`).
  Não some `useSafeAreaInsets` no topo: a moldura já cuida disso.
- **Margem lateral:** `espaco.l` (16). Entre seções: `espaco.xl` (20).
- **Telas das abas** (Início, Reservas, Impressões, Perfil): cabeçalho próprio
  com `<Texto variante="titulo">` (o Início usa `CabecalhoDaMarca`).
- **Telas da pilha logada** (fluxos, detalhes): o cabeçalho com o botão de
  voltar já vem estilizado de `navigation/PrivateNavigator.tsx`, então não desenhe outro.
- **Telas de acesso** (login, cadastro, senha): sem cabeçalho do navegador;
  use `BarraDeVoltar` quando houver para onde voltar.
- **Fluxos de várias telas:** `Trajeto` no topo (`paradas` + `atual`).
- **Fim de fluxo:** `TelaDeConclusao`.
- **Informações agrupadas:** `Cartao` com `LinhaDeInformacao`.
- **Recados na tela:** `Aviso` (`info`, `atencao`, `erro`, `sucesso`).
- **Listas:** `FlatList` com separador de `espaco.m` e estado vazio com
  título (`destaque`) e explicação (`explicacao`), como em `ReservasScreen`.

## Peças

| Peça | Para quê |
| --- | --- |
| `tema/` | `cores`, `fontes`, `variantesDeTexto`, `espaco`, `raio`, `sombra` |
| `Texto`, `Icone` | texto e ícones do app |
| `Botao` | ações (`variante`: primario, contorno, perigo; `tamanho`: normal, alto, compacto) |
| `Campo` | campo de formulário (senha, contador, erro, dica, multilinha) |
| `Sinal`, `SinalComRotulo` | situação no formato de sinal de trem |
| `Bilhete`, `CanhotoDeData` | item com data no canhoto (reservas) |
| `Painel`, `CabecalhoDoPainel`, `RodapeDoPainel`, `Letreiro` | painel de estação com letras que viram |
| `Segmentado` | alternar visões de uma lista |
| `GrupoDeAcoes`, `ItemDeAcao` | lista de atalhos ou opções num cartão |
| `Cartao`, `LinhaDeInformacao` | informações agrupadas |
| `Aviso` | recado curto |
| `Trajeto` | etapas de um fluxo |
| `TelaDeConclusao` | tela de sucesso no fim de um fluxo |
| `CabecalhoDaMarca` | logo e nome no topo do início |
| `BarraDeAbas`, `BarraDeVoltar` | navegação |
