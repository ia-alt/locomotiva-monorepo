import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useORPC } from '../../locomotiva-api/context';
import type { Reserva } from '../../hooks/useReservas';
import { Bilhete, CanhotoDeData, SinalComRotulo, Texto, cores } from '../../ui';
import {
    onlyDateStrToLongBrDate,
    onlyDateStrToTicketParts,
    onlyTimeObjToTimeStr,
} from '../../utils/datetime-formaters';
import { reservaEstaDePe, situacaoDaReserva } from './situacao-da-reserva';

type Props = {
    reserva: Reserva;
    onPress?: () => void;
};

/** Uma reserva como bilhete: data no canhoto, título, sala e horário no corpo, situação no sinal. */
export function BilheteDaReserva({ reserva, onPress }: Props) {
    const orpc = useORPC();
    const { data: sala } = useQuery(orpc.booking.getRoomById.queryOptions({ input: { id: reserva.roomId } }));

    const situacao = situacaoDaReserva(reserva.status);
    const horario = `${onlyTimeObjToTimeStr(reserva.timeInterval.start)} às ${onlyTimeObjToTimeStr(reserva.timeInterval.end)}`;
    const local = sala?.name;

    return (
        <Bilhete
            canhoto={<CanhotoDeData {...onlyDateStrToTicketParts(reserva.day)} />}
            corDoCanhoto={reservaEstaDePe(reserva) ? cores.azul : cores.canhotoInativo}
            onPress={onPress}
            accessibilityLabel={[
                reserva.title,
                local,
                onlyDateStrToLongBrDate(reserva.day),
                horario,
                situacao.rotulo,
            ].filter(Boolean).join(', ')}
        >
            <View style={estilos.textos}>
                <Texto variante="destaque" numberOfLines={1}>
                    {reserva.title}
                </Texto>
                <Texto variante="apoio" cor={cores.textoSecundario} numberOfLines={1}>
                    {local ? `${local} · ${horario}` : horario}
                </Texto>
            </View>
            <SinalComRotulo aspecto={situacao.sinal} rotulo={situacao.rotulo} />
        </Bilhete>
    );
}

const estilos = StyleSheet.create({
    textos: { gap: 3 },
});
