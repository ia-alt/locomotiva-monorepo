import React, { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { ORPCOutputs } from '../locomotiva-api/types';
import { onlyTimeObjToTimeStr } from '../utils/datetime-formaters';
import { Aviso, Icone, Texto, cores, espaco, raio } from '../ui';

type AvailableSlots = ORPCOutputs["booking"]["listAvailableSlotsByDay"]["slots"]
export type AvailabilityTimelineSlot = AvailableSlots[0]

interface AvailabilityTimelineProps {
    availableSlots?: AvailableSlots;
    isLoadingSlots: boolean;
    selectedSlot: AvailabilityTimelineSlot | null;
    setSelectedSlot: (slot: AvailabilityTimelineSlot | null) => void;
}

/** Períodos livres do dia como opções lado a lado; o escolhido ganha a borda azul e o check. */
export default function AvailabilityTimeline({ isLoadingSlots: isLoading, selectedSlot, setSelectedSlot, availableSlots
 }: AvailabilityTimelineProps) {

    const blockWithLabel = useMemo(() => {
        if (!availableSlots) return [];


        function hourToLabel(hour: number): string {
            if (hour >= 6 && hour < 12) return 'Manhã';
            if (hour >= 12 && hour <= 18) return 'Tarde';
            if (hour > 18 && hour < 24) return 'Noite';
            return '';
        }

        return availableSlots.map(slot => {
            const startLabel = hourToLabel(slot.start.hour);
            const endLabel = hourToLabel(slot.end.hour);
            const combinedLabel = startLabel === endLabel ? startLabel : `${startLabel} & ${endLabel}`;
            return {
                slot,
                label: combinedLabel,
            };
        });
    }, [availableSlots]);


    return (
        <View style={estilos.secao}>
            <Texto variante="destaque" accessibilityRole="header">1. Escolha um período</Texto>
            {isLoading ? (
                <ActivityIndicator color={cores.azul} accessibilityLabel="Carregando os horários livres" />
            ) : blockWithLabel.length === 0 ? (
                <Aviso>Nenhum horário disponível para o dia selecionado. Tente outro dia.</Aviso>
            ) : (
                <>
                    <Texto variante="explicacao" cor={cores.textoSecundario}>
                        Depois de escolher o período, você ajusta o horário de início e fim da sua reserva.
                    </Texto>
                    <View style={estilos.opcoes} accessibilityRole="radiogroup">
                        {blockWithLabel.map((item) => {
                            const isSelected = !!selectedSlot && selectedSlot.start.hour === item.slot.start.hour && selectedSlot.start.minute === item.slot.start.minute;
                            const inicio = onlyTimeObjToTimeStr(item.slot.start);
                            const fim = onlyTimeObjToTimeStr(item.slot.end);
                            return (
                                <Pressable
                                    key={`${inicio}-${fim}`}
                                    onPress={() => {
                                        setSelectedSlot(item.slot);
                                    }}
                                    accessibilityRole="radio"
                                    accessibilityState={{ checked: isSelected }}
                                    accessibilityLabel={`${item.label}, das ${inicio} às ${fim}`}
                                    style={({ pressed }) => [
                                        estilos.opcao,
                                        isSelected && estilos.opcaoEscolhida,
                                        pressed && estilos.opcaoPressionada,
                                    ]}
                                >
                                    <View style={estilos.linhaDoRotulo}>
                                        <Texto variante="apoioForte" cor={isSelected ? cores.azulTexto : cores.textoSecundario}>
                                            {item.label}
                                        </Texto>
                                        {isSelected ? <Icone nome="check" cor={cores.azul} tamanho={18} /> : null}
                                    </View>
                                    <Texto variante="destaque">{`${inicio} às ${fim}`}</Texto>
                                </Pressable>
                            );
                        })}
                    </View>
                </>
            )}
        </View>
    );
}

const estilos = StyleSheet.create({
    secao: { gap: espaco.m },
    // Duas opções por linha; se sobrar uma sozinha, ela ocupa a linha toda.
    opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.m },
    opcao: {
        flexGrow: 1,
        flexBasis: '40%',
        gap: espaco.xs,
        paddingVertical: espaco.m,
        paddingHorizontal: espaco.l,
        borderRadius: raio.controle,
        borderWidth: 1.5,
        borderColor: cores.linha,
        backgroundColor: cores.papel,
    },
    opcaoEscolhida: { borderColor: cores.azul, backgroundColor: cores.azulSuave },
    opcaoPressionada: { transform: [{ scale: 0.98 }] },
    linhaDoRotulo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: espaco.s,
    },
});
