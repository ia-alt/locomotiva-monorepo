/**
 * Paleta da identidade "Plataforma".
 *
 * Vem da própria estação: o chão de concreto da plataforma, o papel do
 * bilhete, o grafite do painel de horários, o azul do logo e o amarelo da
 * faixa de segurança. Os sinais usam os três aspectos do sinal ferroviário
 * (vermelho em cima, amarelo no meio, verde embaixo).
 *
 * Todo texto sobre `chao` ou `papel` passa no WCAG AA (4,5:1). O `azul` é
 * para fundos de botão com texto branco; para texto azul use `azulTexto`.
 */
export const cores = {
    chao: '#EAEBE6',
    papel: '#FFFFFF',
    grafite: '#121A26',
    textoSecundario: '#525B66',
    textoApagado: '#626B76',
    linha: '#D9DCD5',
    linhaSobrePapel: '#ECEDE9',
    pressionadoSobrePapel: '#F3F4F0',
    trilhoDoSegmentado: '#DCDED8',
    textoDoSegmentado: '#3F4852',
    perfuracao: '#D3D6CF',
    seta: '#8A929B',

    azul: '#1466E0',
    azulPressionado: '#0F52B8',
    azulTexto: '#0F57C7',
    azulSuave: '#E6EEFB',

    amarelo: '#FFC21A',
    canhotoInativo: '#5F6770',

    erro: '#B3261E',
    erroSuave: '#FBE9E7',
    atencaoTexto: '#7A5200',
    atencaoSuave: '#FFF4D6',
    sucessoTexto: '#137A45',
    sucessoSuave: '#E3F6EA',
    /** Véu atrás de diálogos e folhas. */
    veu: 'rgba(18, 26, 38, 0.45)',
    marcaNaPlaca: '#C5CDD8',

    painel: {
        fundo: '#121A26',
        flapTopo: '#27323F',
        flapBase: '#1E2833',
        fenda: '#0A0F16',
        texto: '#E3E8EE',
        textoFraco: '#A9B4C2',
        divisoria: '#273345',
        letraClara: '#F4F6F8',
    },

    sinal: {
        verde: '#34D073',
        amarelo: '#FFC21A',
        vermelho: '#FF5A4E',
        apagado: '#3A4553',
        apagadoNoPainel: '#2A3442',
        caixa: '#121A26',
        caixaNoPainel: '#0A0F16',
    },
} as const;
