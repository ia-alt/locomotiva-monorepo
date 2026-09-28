import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Bilhete, CanhotoDeData, Icone, Texto, cores, espaco } from '../../ui';
import {
    onlyDateStrToLongBrDate,
    onlyDateStrToTicketParts,
    onlyTimeObjToTimeStr,
} from '../../utils/datetime-formaters';

type Horario = { hour: number; minute: number; second: number };

type Props = {
    titulo: string;
    sala: string;
    /** "2026-09-28" */
    dia: string;
    inicio: Horario;
    fim: Horario;
    pessoas: number;
};

/**
 * O bilhete da reserva antes do envio, como ele vai aparecer em Reservas.
 * No lugar da situação (que só existe depois de enviar) vai a quantidade de pessoas.
 */
export function PreviaDoBilhete({ titulo, sala, dia, inicio, fim, pessoas }: Props) {
    const horario = `${onlyTimeObjToTimeStr(inicio)} às ${onlyTimeObjToTimeStr(fim)}`;
    const quantasPessoas = `${pessoas} ${pessoas === 1 ? 'pessoa' : 'pessoas'}`;

    return (
        <Bilhete
            canhoto={<CanhotoDeData {...onlyDateStrToTicketParts(dia)} />}
            accessibilityLabel={[titulo, sala, onlyDateStrToLongBrDate(dia), horario, quantasPessoas].join(', ')}
        >
            <View style={estilos.textos}>
                <Texto variante="destaque" numberOfLines={1}>
                    {titulo}
                </Texto>
                <Texto variante="apoio" cor={cores.textoSecundario} numberOfLines={1}>
                    {`${sala} · ${horario}`}
                </Texto>
            </View>
            <View style={estilos.pessoas}>
                <Icone nome="pessoas" cor={cores.textoSecundario} tamanho={16} />
                <Texto variante="apoioForte">{quantasPessoas}</Texto>
            </View>
        </Bilhete>
    );
}

const estilos = StyleSheet.create({
    textos: { gap: espaco.xs },
    pessoas: { flexDirection: 'row', alignItems: 'center', gap: espaco.s },
});
