import React, { useEffect, useState } from 'react';
import { usePrivateStackNavigation, usePrivateStackRoute } from '../../../navigation/PrivateNavigator';
import AvailabilityTimeline, { AvailabilityTimelineSlot } from '../../../components/AvailabilityTimeline';
import DateSelector from '../../../components/DateSelector';
import TimeSelector from '../../../components/TimeSelector';
import { EtapaDaReserva } from '../../../components/reservas/EtapaDaReserva';
import { addDays, startOfDay, format } from 'date-fns';
import { useORPC } from '../../../locomotiva-api/context';
import { useQuery } from '@tanstack/react-query';
import { TimePickerModalTimeValue, TimeToSeconds } from '../../../components/TimePickerModal';
import { Botao, Texto, cores } from '../../../ui';

export default function DisponibilidadeReservaScreen() {
    const navigation = usePrivateStackNavigation();
    const route = usePrivateStackRoute<"DisponibilidadeReserva">();
    const { room } = route.params;

    const [selectedDate, setSelectedDate] = useState(() => startOfDay(addDays(new Date(), 1)));
    const [selectedSlot, setSelectedSlot] = useState<AvailabilityTimelineSlot | null>(null);
    const [startTime, setStartTime] = useState<TimePickerModalTimeValue | null>(null);
    const [endTime, setEndTime] = useState<TimePickerModalTimeValue | null>(null);

    useEffect(() => {
        setSelectedSlot(null);
        setStartTime(null);
        setEndTime(null);
    }, [selectedDate]);

    const orpc = useORPC();
    const formattedDay = format(selectedDate, 'yyyy-MM-dd');

    const { data: availableSlots, isLoading: isLoadingSlots } = useQuery({
        ...orpc.booking.listAvailableSlotsByDay.queryOptions({
            input: { roomId: room.id, day: formattedDay }
        }),
    });

    const isFormValid = !!(startTime && endTime &&  TimeToSeconds(startTime) < TimeToSeconds(endTime));

    return (
        <EtapaDaReserva
            etapa={1}
            acao={
                <Botao
                    titulo="Avançar"
                icone="seguir"
                iconeNoFim
                    tamanho="alto"
                    desabilitado={!isFormValid}
                    onPress={() => {
                        if (startTime && endTime) {
                            navigation.navigate('DetalhesReserva', {
                                room,
                                day: format(selectedDate, 'yyyy-MM-dd'),
                                startTime: startTime,
                                endTime: endTime,
                            });
                        }
                    }}
                />
            }
        >
            <Texto variante="explicacao" cor={cores.textoSecundario}>
                Escolha a data e o horário da reserva.
            </Texto>

            <DateSelector
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
            />

            <AvailabilityTimeline
                isLoadingSlots={isLoadingSlots}
                availableSlots={availableSlots?.slots}
                selectedSlot={selectedSlot}
                setSelectedSlot={(slot) => {
                    setSelectedSlot(slot);
                }}
            />

            <TimeSelector
                isLoading={isLoadingSlots}
                timeSlot={selectedSlot}
                startTime={startTime}
                endTime={endTime}
                baseDate={selectedDate}
                onChangeStart={setStartTime}
                onChangeEnd={setEndTime}
            />
        </EtapaDaReserva>
    );
}
