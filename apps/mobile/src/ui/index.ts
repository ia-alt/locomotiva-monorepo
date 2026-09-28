/**
 * Componentes visuais da identidade "Plataforma" (direção A do redesenho).
 * Não conhecem regra de negócio nem API: recebem tudo por props. Os
 * componentes de domínio (reserva, check-in) ficam em `components/` e são
 * montados com estas peças.
 */
export * from './tema';
export { Texto } from './Texto';
export type { VarianteDeTexto } from './Texto';
export { Icone } from './Icone';
export type { NomeDoIcone } from './Icone';
export { Botao } from './Botao';
export { Sinal, SinalComRotulo } from './Sinal';
export type { AspectoDoSinal } from './Sinal';
export { Letreiro, quebrarEmLinhas, capacidadeDoLetreiro } from './Letreiro';
export { Painel, CabecalhoDoPainel, RodapeDoPainel } from './Painel';
export { Bilhete, CanhotoDeData } from './Bilhete';
export { Segmentado } from './Segmentado';
export { GrupoDeAcoes, ItemDeAcao } from './GrupoDeAcoes';
export { CabecalhoDaMarca } from './CabecalhoDaMarca';
export { BarraDeAbas } from './BarraDeAbas';
export { BarraDeVoltar } from './BarraDeVoltar';
export { Campo } from './Campo';
export { Trajeto } from './Trajeto';
export { Cartao, LinhaDeInformacao } from './Cartao';
export { Aviso } from './Aviso';
export { TelaDeConclusao } from './TelaDeConclusao';
export { FalhaAoCarregar } from './FalhaAoCarregar';
