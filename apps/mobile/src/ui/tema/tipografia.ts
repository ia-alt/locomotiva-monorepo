import type { TextStyle } from 'react-native';

/**
 * Famílias carregadas em App.tsx (ver `arquivosDasFontes`). No React Native
 * cada peso é um arquivo e um nome de família: nunca combine com `fontWeight`,
 * senão o Android tenta sintetizar o negrito por cima.
 *
 * A Archivo tem larguras diferentes. A expandida lembra as placas de estação
 * e fica para títulos e para a marca; a semicondensada é a das letras do
 * painel (flaps); a normal é a do texto corrido.
 */
export const fontes = {
    regular: 'Archivo-Regular',
    media: 'Archivo-Medium',
    seminegrito: 'Archivo-SemiBold',
    negrito: 'Archivo-Bold',
    placa: 'ArchivoExpanded-ExtraBold',
    placaMedia: 'ArchivoSemiExpanded-Bold',
    flap: 'ArchivoSemiCondensed-Bold',
    mono: 'IBMPlexMono-Medium',
} as const;

export const arquivosDasFontes = {
    [fontes.regular]: require('../../../assets/fonts/Archivo-Regular.ttf'),
    [fontes.media]: require('../../../assets/fonts/Archivo-Medium.ttf'),
    [fontes.seminegrito]: require('../../../assets/fonts/Archivo-SemiBold.ttf'),
    [fontes.negrito]: require('../../../assets/fonts/Archivo-Bold.ttf'),
    [fontes.placa]: require('../../../assets/fonts/ArchivoExpanded-ExtraBold.ttf'),
    [fontes.placaMedia]: require('../../../assets/fonts/ArchivoSemiExpanded-Bold.ttf'),
    [fontes.flap]: require('../../../assets/fonts/ArchivoSemiCondensed-Bold.ttf'),
    [fontes.mono]: require('../../../assets/fonts/IBMPlexMono-Medium.ttf'),
};

/** Estilos de texto nomeados. As telas escolhem pelo papel, não pelo tamanho. */
export const variantesDeTexto = {
    /** Título de tela ("Reservas") e números do canhoto do bilhete. */
    titulo: { fontFamily: fontes.placa, fontSize: 28, lineHeight: 32 },
    /** Nome "Locomotiva Hub" nas barras e placas. */
    marca: { fontFamily: fontes.placa, fontSize: 19, lineHeight: 23 },
    /** Frase de abertura da tela de entrada. */
    chamada: { fontFamily: fontes.placaMedia, fontSize: 27, lineHeight: 31 },
    /** Título de seção ("Chegou ao hub?"). */
    secao: { fontFamily: fontes.placaMedia, fontSize: 20, lineHeight: 25 },
    /** "Olá, Nome" no início. Largura normal: a expandida ficava apertada aqui. */
    saudacao: { fontFamily: fontes.seminegrito, fontSize: 28, lineHeight: 33 },
    corpoGrande: { fontFamily: fontes.regular, fontSize: 17, lineHeight: 22 },
    corpo: { fontFamily: fontes.regular, fontSize: 16, lineHeight: 23 },
    /** Frase curta que explica uma ação ("Escaneie o QR code da recepção..."). */
    explicacao: { fontFamily: fontes.regular, fontSize: 15, lineHeight: 21 },
    destaque: { fontFamily: fontes.negrito, fontSize: 16, lineHeight: 21 },
    destaqueMedio: { fontFamily: fontes.seminegrito, fontSize: 16, lineHeight: 21 },
    apoio: { fontFamily: fontes.regular, fontSize: 14, lineHeight: 19 },
    apoioForte: { fontFamily: fontes.seminegrito, fontSize: 14, lineHeight: 19 },
    rotulo: { fontFamily: fontes.seminegrito, fontSize: 12, lineHeight: 15 },
    /** Datas e horários no estilo de bilhete impresso ("SEG 28 SET"). */
    mono: { fontFamily: fontes.mono, fontSize: 13, lineHeight: 17, letterSpacing: 0.6 },
    botao: { fontFamily: fontes.negrito, fontSize: 16, lineHeight: 20 },
} satisfies Record<string, TextStyle>;
