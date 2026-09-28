import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { addDays, format, isSameDay, startOfDay } from 'date-fns';
import CalendarModal from './CalendarModal';
import { ALVO_DE_TOQUE, Icone, Texto, cores, espaco, raio } from '../ui';
import { onlyDateStrToLongBrDate, onlyDateStrToTicketParts } from '../utils/datetime-formaters';

interface DateSelectorProps {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
}

const LARGURA_DA_PLACA = 60;
const VAO_ENTRE_PLACAS = espaco.s;

/**
 * Fita de dias como placas pequenas (dia da semana, número e mês, como no
 * canhoto do bilhete). A escolhida fica azul, igual ao canhoto que ela vai virar.
 */
export default function DateSelector({ selectedDate, setSelectedDate }: DateSelectorProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Seis dias antes e sete depois do escolhido, nunca antes de amanhã (não há reserva para o mesmo dia).
    const dates = useMemo(() => {
        const baseDate = startOfDay(selectedDate);
        const minValidDate = startOfDay(addDays(new Date(), 1));

        let startWindow = addDays(baseDate, -6);
        if (startWindow < minValidDate) {
            startWindow = minValidDate;
        }

        return Array.from({ length: 14 }).map((_, i) => addDays(startWindow, i));
    }, [selectedDate]);

    // Traz a placa escolhida para perto do meio da fita sempre que o dia muda.
    useEffect(() => {
        const index = dates.findIndex(d => isSameDay(d, selectedDate));
        if (index !== -1 && scrollViewRef.current) {
            const itemWidth = LARGURA_DA_PLACA + VAO_ENTRE_PLACAS;
            const offset = Math.max(0, index * itemWidth - 100);
            scrollViewRef.current.scrollTo({ x: offset, animated: true });
        }
    }, [selectedDate, dates]);

    return (
        <View style={estilos.secao}>
            <View style={estilos.cabecalho}>
                <Texto variante="destaque" accessibilityRole="header">Data</Texto>
                <Pressable
                    onPress={() => setModalVisible(true)}
                    accessibilityRole="button"
                    style={({ pressed }) => [estilos.linkDoCalendario, pressed && estilos.linkPressionado]}
                >
                    <Icone nome="calendario" cor={cores.azulTexto} tamanho={18} />
                    <Texto variante="apoioForte" cor={cores.azulTexto}>Ver calendário</Texto>
                </Pressable>
            </View>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={estilos.fita}
                contentContainerStyle={estilos.placas}
            >
                {dates.map((date) => {
                    const dia = format(date, 'yyyy-MM-dd');
                    const partes = onlyDateStrToTicketParts(dia);
                    const escolhida = isSameDay(date, selectedDate);
                    const corDoTexto = escolhida ? cores.papel : cores.grafite;
                    const corDaLegenda = escolhida ? cores.papel : cores.textoSecundario;

                    return (
                        <Pressable
                            key={dia}
                            onPress={() => setSelectedDate(date)}
                            accessibilityRole="button"
                            accessibilityLabel={onlyDateStrToLongBrDate(dia)}
                            accessibilityState={{ selected: escolhida }}
                            style={({ pressed }) => [
                                estilos.placa,
                                escolhida && estilos.placaEscolhida,
                                pressed && estilos.placaPressionada,
                            ]}
                        >
                            <Texto variante="mono" cor={corDaLegenda}>{partes.diaDaSemana}</Texto>
                            <Texto variante="titulo" cor={corDoTexto}>{partes.dia}</Texto>
                            <Texto variante="mono" cor={corDaLegenda}>{partes.mes}</Texto>
                        </Pressable>
                    );
                })}
            </ScrollView>

            <CalendarModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                initialDate={selectedDate}
                onConfirm={(date) => setSelectedDate(date)}
            />
        </View>
    );
}

const estilos = StyleSheet.create({
    secao: { gap: espaco.m },
    cabecalho: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    linkDoCalendario: {
        minHeight: ALVO_DE_TOQUE,
        flexDirection: 'row',
        alignItems: 'center',
        gap: espaco.xs,
        paddingHorizontal: espaco.xs,
    },
    linkPressionado: { opacity: 0.6 },
    // A fita vai de ponta a ponta da tela: desfaz a margem lateral da etapa e
    // devolve como recuo, para a primeira placa alinhar com o resto do conteúdo.
    fita: { marginHorizontal: -espaco.l },
    placas: { gap: VAO_ENTRE_PLACAS, paddingHorizontal: espaco.l },
    placa: {
        width: LARGURA_DA_PLACA,
        alignItems: 'center',
        gap: espaco.xxs,
        paddingVertical: espaco.s,
        borderRadius: raio.controle,
        borderWidth: 1.5,
        borderColor: cores.linha,
        backgroundColor: cores.papel,
    },
    placaEscolhida: { borderColor: cores.azul, backgroundColor: cores.azul },
    placaPressionada: { transform: [{ scale: 0.96 }] },
});
