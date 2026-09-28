import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle, useWindowDimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useORPC } from '../../locomotiva-api/context';
import { useCheckin } from '../../contexts/checkin-context';
import { usePrivateStackNavigation } from '../../navigation/PrivateNavigator';
import { EXPEDIENTE } from '../../constants/espaco';
import { horaEMinuto, useCronometro } from '../../hooks/useCronometro';
import { Reserva, useProximaReserva } from '../../hooks/useReservas';
import { useSituacaoDoHub } from '../../hooks/useSituacaoDoHub';
import {
    CabecalhoDoPainel,
    Letreiro,
    Painel,
    RodapeDoPainel,
    SinalComRotulo,
    Texto,
    capacidadeDoLetreiro,
    cores,
    espaco,
    quebrarEmLinhas,
} from '../../ui';
import { onlyDateStrToTicketParts, onlyTimeObjToTimeStr } from '../../utils/datetime-formaters';
import { situacaoDaReserva } from '../reservas/situacao-da-reserva';

/** Mesmo limite do App.tsx: no navegador largo o app fica numa coluna central. */
const LARGURA_MAXIMA_DO_APP = 800;
const PLACA_GRANDE_MAXIMA = 42;
const PLACA_DE_NOME = 24;
const VAO_DE_NOME = 3;

/** Largura útil dentro do painel: tela menos as margens da tela e do painel. */
function useLarguraUtilDoPainel() {
    const { width } = useWindowDimensions();
    return Math.min(width, LARGURA_MAXIMA_DO_APP) - 4 * espaco.l;
}

/** Maior placa em que `quantidade` placas e `separadores` dois-pontos cabem na largura. */
function larguraDaPlacaGrande(larguraUtil: number, quantidade: number, separadores: number) {
    const vao = 4;
    const porPlaca = quantidade + separadores * 0.43;
    const cabe = Math.floor((larguraUtil - vao * (quantidade + separadores)) / porPlaca);
    return Math.min(PLACA_GRANDE_MAXIMA, cabe);
}

const PLACA_DE_NOME_MINIMA = 18;

/**
 * Nomes curtos ("SALA MULTIUSO") cabem numa linha só diminuindo um pouco as
 * placas; nomes longos ("LABORATÓRIO MAKER") quebram em duas linhas.
 */
function linhasDoNome(nome: string, larguraUtil: number) {
    const texto = nome.toUpperCase();
    const placaQueCabe = Math.floor((larguraUtil + VAO_DE_NOME) / texto.length) - VAO_DE_NOME;
    if (placaQueCabe >= PLACA_DE_NOME_MINIMA) {
        return { linhas: [texto], larguraDaPlaca: Math.min(PLACA_DE_NOME, placaQueCabe) };
    }
    const capacidade = capacidadeDoLetreiro(larguraUtil, PLACA_DE_NOME, VAO_DE_NOME);
    return { linhas: quebrarEmLinhas(texto, capacidade).slice(0, 2), larguraDaPlaca: PLACA_DE_NOME };
}

/**
 * Painel de estação do início: o tempo no hub (com check-in ativo) ou a
 * próxima reserva. Sem nenhum dos dois não aparece nada, e o resto da tela
 * sobe; enquanto carrega também fica vazio, para não piscar um painel que
 * pode sumir.
 */
export function PainelDoInicio({ style }: { style?: StyleProp<ViewStyle> }) {
    const { isCheckedIn, checkInTime, isLoading: carregandoCheckin } = useCheckin();
    const { proxima, carregando: carregandoReserva } = useProximaReserva();
    const larguraUtil = useLarguraUtilDoPainel();

    if (carregandoCheckin || (carregandoReserva && !isCheckedIn)) return null;
    if (isCheckedIn && checkInTime) {
        return (
            <View style={style}>
                <PainelNoHub entrada={checkInTime} larguraUtil={larguraUtil} />
            </View>
        );
    }
    if (proxima) {
        return (
            <View style={style}>
                <PainelDaProximaReserva reserva={proxima} larguraUtil={larguraUtil} />
            </View>
        );
    }
    return null;
}

function PainelNoHub({ entrada, larguraUtil }: { entrada: Date; larguraUtil: number }) {
    const tempo = useCronometro(entrada) ?? '00:00:00';
    const hub = useSituacaoDoHub();
    const fechamento = horaEMinuto(new Date(2000, 0, 1, EXPEDIENTE.fecha.hora, EXPEDIENTE.fecha.minuto));

    return (
        <Painel>
            <CabecalhoDoPainel titulo="Você está no hub há" detalhe={`ENTRADA ${horaEMinuto(entrada)}`} />
            <Letreiro texto={tempo} larguraDaPlaca={larguraDaPlacaGrande(larguraUtil, 6, 2)} />
            <RodapeDoPainel>
                <Texto variante="apoio" cor={cores.painel.textoFraco} style={estilos.encolhe}>
                    {hub.aberto ? `O hub fecha às ${fechamento}` : `Hub fechado, ${hub.detalhe}`}
                </Texto>
                <SinalComRotulo aspecto="verde" rotulo="Check-in ativo" noPainel variante="apoio" />
            </RodapeDoPainel>
        </Painel>
    );
}

function PainelDaProximaReserva({ reserva, larguraUtil }: { reserva: Reserva; larguraUtil: number }) {
    const orpc = useORPC();
    const navigation = usePrivateStackNavigation();
    const { data: sala } = useQuery(orpc.booking.getRoomById.queryOptions({ input: { id: reserva.roomId } }));

    const data = onlyDateStrToTicketParts(reserva.day);
    const inicio = onlyTimeObjToTimeStr(reserva.timeInterval.start);
    const fim = onlyTimeObjToTimeStr(reserva.timeInterval.end);
    const situacao = situacaoDaReserva(reserva.status);
    const nomeDaSala = sala ? linhasDoNome(sala.name, larguraUtil) : null;

    return (
        <Pressable
            onPress={() => navigation.navigate('DetalhesMinhaReserva', { bookingId: reserva.id })}
            accessibilityRole="button"
            accessibilityHint="Abre os detalhes da reserva"
            style={({ pressed }) => pressed && estilos.pressionado}
        >
            <Painel>
                <CabecalhoDoPainel titulo="Sua próxima reserva" detalhe={`${data.diaDaSemana} ${data.dia} ${data.mes}`} />
                <Letreiro texto={inicio} larguraDaPlaca={larguraDaPlacaGrande(larguraUtil, 4, 1)} />
                {nomeDaSala?.linhas.map((linha, indice) => (
                    <Letreiro
                        key={`${indice}-${linha}`}
                        texto={linha}
                        larguraDaPlaca={nomeDaSala.larguraDaPlaca}
                        corDaLetra={cores.painel.letraClara}
                        atraso={250 + indice * 200}
                        vao={VAO_DE_NOME}
                    />
                ))}
                <RodapeDoPainel>
                    <View style={estilos.rodapeDaReserva}>
                        <Texto variante="destaqueMedio" cor={cores.papel} numberOfLines={1}>
                            {reserva.title}
                        </Texto>
                        <View style={estilos.linhaDoHorario}>
                            <Texto variante="apoio" cor={cores.painel.textoFraco}>{`${inicio} às ${fim}`}</Texto>
                            <SinalComRotulo aspecto={situacao.sinal} rotulo={situacao.rotulo} noPainel variante="apoio" />
                        </View>
                    </View>
                </RodapeDoPainel>
            </Painel>
        </Pressable>
    );
}

const estilos = StyleSheet.create({
    pressionado: { opacity: 0.9 },
    encolhe: { flexShrink: 1 },
    rodapeDaReserva: { flex: 1, gap: 6 },
    linhaDoHorario: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
});
