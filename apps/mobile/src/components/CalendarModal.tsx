import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    isSameMonth,
    isSameDay,
    isBefore,
    isToday,
    startOfDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FolhaDeEscolha } from './reservas/FolhaDeEscolha';
import { ALVO_DE_TOQUE, Icone, NomeDoIcone, Texto, cores, espaco } from '../ui';

interface CalendarModalProps {
    visible: boolean;
    onClose: () => void;
    initialDate: Date;
    onConfirm: (date: Date) => void;
}

const DIAS_DA_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const ALTURA_DA_SEMANA = 48;
const DIA = 40;
const PONTO_DE_HOJE = 4;
/** Um mês ocupa até seis semanas; a folha reserva as seis para não mudar de altura entre os meses. */
const SEMANAS_NO_MAXIMO = 6;

export default function CalendarModal({ visible, onClose, initialDate, onConfirm }: CalendarModalProps) {
    const [currentMonth, setCurrentMonth] = useState(initialDate);
    const [selectedDate, setSelectedDate] = useState(initialDate);

    // Ao abrir, volta para o mês e o dia escolhidos na tela.
    useEffect(() => {
        if (visible) {
            setCurrentMonth(initialDate);
            setSelectedDate(initialDate);
        }
    }, [visible, initialDate]);

    const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const weeks = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 }); // semana começa no domingo
        const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });

        const days = [];
        let day = start;
        // Trava contra laço infinito: um mês nunca passa de seis semanas.
        const MAX_DAYS = 42;
        let cnt = 0;
        while (day <= end && cnt < MAX_DAYS) {
            days.push(day);
            day = addDays(day, 1);
            cnt++;
        }

        const weeksArray = [];
        for (let i = 0; i < days.length; i += 7) {
            weeksArray.push(days.slice(i, i + 7));
        }
        return weeksArray;
    }, [currentMonth]);

    const monthTitle = format(currentMonth, 'MMMM yyyy', { locale: ptBR });

    return (
        <FolhaDeEscolha
            visivel={visible}
            titulo="Selecionar data"
            aoFechar={onClose}
            aoConfirmar={() => {
                onConfirm(selectedDate);
                onClose();
            }}
        >
            <View style={estilos.navegacao}>
                <BotaoDoMes icone="voltar" rotulo="Mês anterior" onPress={handlePreviousMonth} />
                <Texto variante="destaque" accessibilityRole="header">
                    {monthTitle.charAt(0).toUpperCase() + monthTitle.slice(1)}
                </Texto>
                <BotaoDoMes icone="seguir" rotulo="Próximo mês" onPress={handleNextMonth} />
            </View>

            <View>
                <View style={estilos.semana}>
                    {DIAS_DA_SEMANA.map((dia) => (
                        <Texto key={dia} variante="rotulo" cor={cores.textoSecundario} style={estilos.diaDaSemana}>
                            {dia}
                        </Texto>
                    ))}
                </View>

                <View style={estilos.mes}>
                    {weeks.map((week, idx) => (
                        <View key={idx} style={estilos.semana}>
                            {week.map((date, dayIdx) => {
                                const isCurrentMonth = isSameMonth(date, currentMonth);
                                const isSelected = isSameDay(date, selectedDate);
                                const isDateToday = isToday(date);

                                const minValidDate = startOfDay(addDays(new Date(), 1));
                                const isDisabled = isBefore(startOfDay(date), minValidDate);

                                return (
                                    <Pressable
                                        key={dayIdx}
                                        style={estilos.celula}
                                        onPress={() => setSelectedDate(date)}
                                        disabled={isDisabled}
                                        accessibilityRole="button"
                                        accessibilityLabel={format(date, "d 'de' MMMM", { locale: ptBR })}
                                        accessibilityState={{ selected: isSelected, disabled: isDisabled }}
                                    >
                                        <View style={[
                                            estilos.dia,
                                            isSelected && estilos.diaEscolhido,
                                            !isSelected && isDateToday && estilos.diaDeHoje,
                                        ]}>
                                            <Texto
                                                variante={isSelected ? 'destaque' : 'destaqueMedio'}
                                                cor={corDoDia({ isSelected, isDisabled, isDateToday, isCurrentMonth })}
                                                style={isDisabled && estilos.diaRiscado}
                                            >
                                                {format(date, 'd')}
                                            </Texto>
                                            {!isSelected && isDateToday && (
                                                <View style={estilos.pontoDeHoje} />
                                            )}
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </View>
        </FolhaDeEscolha>
    );
}

/** Mesma prioridade das cores de antes: escolhido, hoje, dia que já passou, dia de outro mês. */
function corDoDia({ isSelected, isDisabled, isDateToday, isCurrentMonth }: {
    isSelected: boolean;
    isDisabled: boolean;
    isDateToday: boolean;
    isCurrentMonth: boolean;
}) {
    if (isSelected) return cores.papel;
    if (isDateToday) return cores.azulTexto;
    if (isDisabled) return cores.perfuracao;
    if (!isCurrentMonth) return cores.seta;
    return cores.grafite;
}

function BotaoDoMes({ icone, rotulo, onPress }: { icone: NomeDoIcone; rotulo: string; onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={rotulo}
            style={({ pressed }) => [estilos.botaoDoMes, pressed && estilos.botaoDoMesPressionado]}
        >
            <Icone nome={icone} cor={cores.azulTexto} tamanho={22} />
        </Pressable>
    );
}

const estilos = StyleSheet.create({
    navegacao: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    botaoDoMes: {
        width: ALVO_DE_TOQUE,
        height: ALVO_DE_TOQUE,
        borderRadius: ALVO_DE_TOQUE / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    botaoDoMesPressionado: { backgroundColor: cores.pressionadoSobrePapel },
    semana: { flexDirection: 'row' },
    diaDaSemana: { flex: 1, textAlign: 'center', paddingBottom: espaco.s },
    mes: { minHeight: SEMANAS_NO_MAXIMO * ALTURA_DA_SEMANA },
    celula: {
        flex: 1,
        height: ALTURA_DA_SEMANA,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dia: {
        width: DIA,
        height: DIA,
        borderRadius: DIA / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    diaEscolhido: { backgroundColor: cores.azul },
    diaDeHoje: { borderWidth: 1.5, borderColor: cores.azul },
    diaRiscado: { textDecorationLine: 'line-through' },
    pontoDeHoje: {
        position: 'absolute',
        bottom: espaco.xs,
        width: PONTO_DE_HOJE,
        height: PONTO_DE_HOJE,
        borderRadius: PONTO_DE_HOJE / 2,
        backgroundColor: cores.azul,
    },
});
