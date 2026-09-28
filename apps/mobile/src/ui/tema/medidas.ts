/** Espaçamentos em múltiplos de 4. Margem lateral padrão das telas: `l` (16). */
export const espaco = {
    xxs: 2,
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
} as const;

/**
 * Raios. Botões são pílula (`botao`), como o "Entrar com GOV.BR", que é
 * pílula por regra do design system do governo e aparece ao lado dos nossos.
 * Campos usam `controle`; superfícies grandes (painel, grupos de ações) usam `cartao`.
 */
export const raio = {
    flap: 6,
    controle: 12,
    botao: 999,
    bilhete: 16,
    cartao: 18,
    pilula: 999,
} as const;

/** Sombras em `boxShadow` (nova arquitetura do RN): mesmo resultado em iOS, Android e web. */
export const sombra = {
    bilhete: '0px 1px 1px rgba(18, 26, 38, 0.07), 0px 8px 18px rgba(18, 26, 38, 0.07)',
    placa: '0px 14px 30px rgba(18, 26, 38, 0.28)',
    segmentoAtivo: '0px 1px 2px rgba(18, 26, 38, 0.12)',
} as const;

/** Área mínima de toque (Apple HIG e Material). */
export const ALVO_DE_TOQUE = 44;
