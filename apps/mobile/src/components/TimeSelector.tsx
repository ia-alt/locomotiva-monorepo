import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import TimePickerModal, { TimePickerModalTimeValue, TimeToSeconds } from './TimePickerModal';
import { AvailabilityTimelineSlot } from './AvailabilityTimeline';
import { onlyTimeObjToTimeStr } from '../utils/datetime-formaters';
import { Icone, Texto, cores, espaco, raio, variantesDeTexto } from '../ui';


interface TimeSelectorProps {
    timeSlot: AvailabilityTimelineSlot | null;
    isLoading: boolean;
    baseDate: Date;
    startTime: TimePickerModalTimeValue | null;
    endTime: TimePickerModalTimeValue | null;
    onChangeStart: (time: TimePickerModalTimeValue | null) => void;
    onChangeEnd: (time: TimePickerModalTimeValue | null) => void;
}

/** Horário de início e de fim, lado a lado. Cada caixa abre a lista de horários do período escolhido. */
export default function TimeSelector({ baseDate, startTime, endTime, onChangeStart, onChangeEnd, isLoading, timeSlot }: TimeSelectorProps) {
    const [activePicker, setActivePicker] = useState<'none' | 'start' | 'end'>('none');
    const enabled = !!timeSlot;
    const hasError = !!(startTime && endTime && TimeToSeconds(endTime) <= TimeToSeconds(startTime));

    useEffect(() => {
        onChangeStart(null);
        onChangeEnd(null);
    }, [timeSlot]);

    return (
        <View style={estilos.secao}>
            <Texto variante="destaque" accessibilityRole="header">2. Ajuste o horário da reserva</Texto>
            <View style={estilos.linha}>
                <CaixaDeHorario
                    rotulo="Início"
                    horario={startTime}
                    carregando={isLoading}
                    desabilitada={!enabled}
                    onPress={() => setActivePicker('start')}
                />

                <Icone nome="seguir" cor={cores.seta} tamanho={20} />

                <CaixaDeHorario
                    rotulo="Fim"
                    horario={endTime}
                    carregando={isLoading}
                    desabilitada={!enabled || !startTime}
                    comErro={hasError}
                    onPress={() => setActivePicker('end')}
                />
            </View>

            <TimePickerModal
                visible={activePicker !== 'none'}
                onClose={() => setActivePicker('none')}
                initialTime={activePicker === 'start' ? startTime : endTime}
                title={activePicker === 'start' ? 'Horário de início' : 'Horário de fim'}
                minTime={
                    activePicker === 'start'
                        ? (timeSlot?.start || undefined)
                        : (startTime ? add30Minutes(startTime) : undefined)
                }
                maxTime={
                    activePicker === 'start'
                        ? (timeSlot?.end ? sub30Minutes(timeSlot.end) : undefined)
                        : (timeSlot?.end || undefined)
                }
                onConfirm={(time) => {
                    if (activePicker === 'start') {
                        onChangeStart(time);
                        onChangeEnd(null); // com outro início, o fim escolhido deixa de valer
                    } else if (activePicker === 'end') {
                        onChangeEnd(time);
                    }
                }}
            />
        </View>
    );
}

type PropsDaCaixa = {
    rotulo: string;
    horario: TimePickerModalTimeValue | null;
    carregando: boolean;
    desabilitada: boolean;
    comErro?: boolean;
    onPress: () => void;
};

function CaixaDeHorario({ rotulo, horario, carregando, desabilitada, comErro = false, onPress }: PropsDaCaixa) {
    const corDoDestaque = comErro ? cores.erro : horario ? cores.azulTexto : cores.textoSecundario;

    return (
        <Pressable
            onPress={onPress}
            disabled={desabilitada}
            accessibilityRole="button"
            accessibilityLabel={`${rotulo}: ${horario ? onlyTimeObjToTimeStr(horario) : 'não escolhido'}`}
            accessibilityState={{ disabled: desabilitada }}
            style={({ pressed }) => [
                estilos.caixa,
                !!horario && estilos.caixaPreenchida,
                comErro && estilos.caixaComErro,
                desabilitada && estilos.caixaDesabilitada,
                pressed && estilos.caixaPressionada,
            ]}
        >
            <View style={estilos.rotulo}>
                <Icone nome="relogio" cor={corDoDestaque} tamanho={16} />
                <Texto variante="apoioForte" cor={corDoDestaque}>{rotulo}</Texto>
            </View>
            {carregando ? (
                <ActivityIndicator color={cores.textoSecundario} style={estilos.carregando} />
            ) : (
                <Texto variante="titulo" cor={comErro ? cores.erro : horario ? cores.grafite : cores.textoApagado}>
                    {horario ? onlyTimeObjToTimeStr(horario) : '--:--'}
                </Texto>
            )}
        </Pressable>
    );
}

function add30Minutes(time: TimePickerModalTimeValue): TimePickerModalTimeValue {
    let hour = time.hour;
    let minute = time.minute + 30;
    if (minute >= 60) {
        hour += 1;
        minute -= 60;
    }
    return { hour, minute, second: 0 };
}

function sub30Minutes(time: TimePickerModalTimeValue): TimePickerModalTimeValue {
    let hour = time.hour;
    let minute = time.minute - 30;
    if (minute < 0) {
        hour -= 1;
        minute += 60;
    }
    return { hour, minute, second: 0 };
}

const estilos = StyleSheet.create({
    secao: { gap: espaco.m },
    linha: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: espaco.s,
    },
    caixa: {
        flex: 1,
        alignItems: 'center',
        gap: espaco.xs,
        paddingVertical: espaco.m,
        borderRadius: raio.controle,
        borderWidth: 1.5,
        borderColor: cores.linha,
        backgroundColor: cores.papel,
    },
    caixaPreenchida: { borderColor: cores.azul },
    caixaComErro: { borderColor: cores.erro, backgroundColor: cores.erroSuave },
    caixaDesabilitada: { opacity: 0.5 },
    caixaPressionada: { transform: [{ scale: 0.97 }] },
    rotulo: { flexDirection: 'row', alignItems: 'center', gap: espaco.xs },
    // Mesma altura da linha do horário, para a caixa não mudar de tamanho ao carregar.
    carregando: { height: variantesDeTexto.titulo.lineHeight },
});
