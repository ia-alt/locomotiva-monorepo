/**
 * Design Tokens — Locomotiva Hub
 * ---------------------------------
 * Fonte ÚNICA da verdade para o visual do app.
 * Direção visual: "Institucional Confiável" (azul-marinho sóbrio, espaço branco,
 * cantos suaves). Sempre que precisar de uma cor, espaçamento, raio ou tamanho de
 * fonte, importe daqui — NUNCA escreva valores soltos (ex: '#08184B') nas telas.
 *
 * Por que isso importa: é o que mantém TODAS as telas consistentes. É a diferença
 * entre "parece um app feito por um time" e "parece uma colagem de telas".
 */

export const colors = {
  // Marca — azul-marinho institucional
  brand: {
    navy: '#16306B', // azul profundo: botões principais, cabeçalhos
    blue: '#1E50A0', // azul interativo: links, foco, ícones ativos
    light: '#E8EFFB', // azul bem claro: fundos de destaque suaves
  },

  // Texto
  text: {
    primary: '#0F172A', // títulos e texto principal
    secondary: '#475569', // texto de apoio, descrições
    muted: '#94A3B8', // placeholders, legendas, divisores
    onBrand: '#FFFFFF', // texto sobre fundo azul-marinho
  },

  // Superfícies / fundos
  surface: {
    background: '#F4F7FB', // fundo geral do app (cinza-azulado bem claro)
    card: '#FFFFFF', // cards, inputs
    subtle: '#F1F5F9', // áreas levemente destacadas
  },

  // Bordas
  border: {
    subtle: '#E2E8F0', // bordas leves (inputs em repouso, divisores)
    strong: '#CBD5E1', // bordas com mais presença
  },

  // Estados
  feedback: {
    success: '#15803D',
    error: '#DC2626',
    warning: '#D97706',
    info: '#1E50A0',
  },
} as const;

/**
 * Tema ESCURO da landing (tela de Entrada). Mantém o clima sofisticado do fundo
 * escuro, mas com UM acento só (sem o "neon" cyan+roxo+lavanda de antes) — é isso
 * que transforma a landing de "rave" em "institucional confiável".
 */
export const landing = {
  bg: '#0B1E3F', // azul-marinho base (mais sóbrio que o #08184B antigo)
  surface: '#10254A', // cards sobre o fundo
  surfaceBorder: 'rgba(255,255,255,0.08)',
  text: '#EAF0FA', // texto principal claro
  textMuted: 'rgba(234,240,250,0.72)', // texto de apoio
  textFaint: 'rgba(234,240,250,0.5)', // legendas, copyright
  accent: '#4F8CFF', // ÚNICO acento — azul vivo, mas não neon
  divider: 'rgba(255,255,255,0.14)',
} as const;

/** Escala de espaçamento (múltiplos de 4). Use SEMPRE estes valores, nunca números soltos. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** Raios de borda. Cantos suaves = sensação "confiável/limpa". */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

/** Tipografia — fonte HankenGrotesk (já carregada no App.tsx). */
export const typography = {
  family: 'HankenGrotesk',
  size: {
    xs: 12,
    sm: 13,
    base: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

/** Sombras suaves e discretas (estilo institucional = nada de sombra exagerada). */
export const elevation = {
  none: 0,
  card: 1,
  raised: 2,
} as const;
