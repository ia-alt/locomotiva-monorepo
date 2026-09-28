import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { onlyTimeObjToTimeStr } from '../utils/datetime-formaters';
import { FolhaDeEscolha } from './reservas/FolhaDeEscolha';
import { Texto, cores, espaco, raio } from '../ui';

export type TimePickerModalTimeValue = {hour: number, minute: number, second: number};

interface TimePickerModalProps {
    visible: boolean;
    onClose: () => void;
    initialTime: TimePickerModalTimeValue | null;
    onConfirm: (time: TimePickerModalTimeValue) => void;
    title: string;
    minTime?: TimePickerModalTimeValue;
    maxTime?: TimePickerModalTimeValue;
}

const START_HOUR = 8;
const END_HOUR = 17;
const ALTURA_DO_HORARIO = 48;

export default function TimePickerModal({ visible, onClose, initialTime, onConfirm, title, minTime, maxTime }: TimePickerModalProps) {
    const [selectedTime, setSelectedTime] = useState<TimePickerModalTimeValue | null>(initialTime);
    const { height } = useWindowDimensions();

    useEffect(() => {
        if (visible) {
            setSelectedTime(initialTime);
        }
    }, [visible, initialTime]);

    // Horários de 30 em 30 minutos
    const timeSlots = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
        timeSlots.push({ hour: h, minute: 0, second: 0 });
        if (h < END_HOUR) {
            timeSlots.push({ hour: h, minute: 30, second: 0 });
        }
    }

    return (
        <FolhaDeEscolha
            visivel={visible}
            titulo={title}
            altura={height * 0.6}
            aoFechar={onClose}
            confirmarDesabilitado={!selectedTime}
            aoConfirmar={() => {
                if (selectedTime) onConfirm(selectedTime);
                onClose();
            }}
        >
            <ScrollView style={estilos.rolagem} showsVerticalScrollIndicator={false}>
                <View style={estilos.grade}>
                    {timeSlots.map((time, idx) => {
                        const isSelected = selectedTime &&
                            time.hour === selectedTime.hour &&
                            time.minute === selectedTime.minute;

                        let isDisabled = false;
                        if (minTime && TimeToSeconds(time) < TimeToSeconds(minTime)) isDisabled = true;
                        if (maxTime && TimeToSeconds(time) > TimeToSeconds(maxTime)) isDisabled = true;

                        return (
                            <Pressable
                                key={idx}
                                style={({ pressed }) => [
                                    estilos.horario,
                                    isSelected && estilos.horarioEscolhido,
                                    isDisabled && estilos.horarioIndisponivel,
                                    pressed && !isDisabled && !isSelected && estilos.horarioPressionado,
                                ]}
                                onPress={() => !isDisabled && setSelectedTime(time)}
                                accessibilityRole="button"
                                accessibilityState={{ selected: !!isSelected, disabled: isDisabled }}
                            >
                                <Texto
                                    variante={isSelected ? 'destaque' : 'destaqueMedio'}
                                    cor={isDisabled ? cores.textoApagado : isSelected ? cores.papel : cores.grafite}
                                    style={isDisabled && estilos.textoRiscado}
                                >
                                    {onlyTimeObjToTimeStr(time)}
                                </Texto>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>
        </FolhaDeEscolha>
    );
}

export function TimeToSeconds(time: TimePickerModalTimeValue) {
    return time.hour * 3600 + time.minute * 60 + time.second;
}

const estilos = StyleSheet.create({
    rolagem: { flex: 1 },
    grade: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: espaco.m,
        justifyContent: 'center',
    },
    horario: {
        width: '30%',
        height: ALTURA_DO_HORARIO,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: raio.controle,
        borderWidth: 1.5,
        borderColor: cores.linha,
        backgroundColor: cores.papel,
    },
    horarioEscolhido: { borderColor: cores.azul, backgroundColor: cores.azul },
    horarioIndisponivel: { borderColor: cores.chao, backgroundColor: cores.chao },
    horarioPressionado: { backgroundColor: cores.pressionadoSobrePapel },
    textoRiscado: { textDecorationLine: 'line-through' },
});
