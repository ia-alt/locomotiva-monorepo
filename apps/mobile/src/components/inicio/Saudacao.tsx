import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Texto, cores } from '../../ui';

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** "Segunda, 28 de setembro" */
export function dataPorExtenso(data: Date): string {
    return `${DIAS[data.getDay()]}, ${data.getDate()} de ${MESES[data.getMonth()]}`;
}

/** Data do dia pequena e "Olá, Nome" embaixo (opção 1 do quadro de saudações). */
export function Saudacao({ nome }: { nome?: string | null }) {
    const primeiroNome = nome?.trim().split(/\s+/)[0];
    const saudacao = primeiroNome ? `Olá, ${primeiroNome}` : 'Olá';
    const data = dataPorExtenso(new Date());

    return (
        <View style={estilos.saudacao} accessible accessibilityRole="header" accessibilityLabel={`${saudacao}. ${data}`}>
            <Texto variante="explicacao" cor={cores.textoSecundario}>{data}</Texto>
            <Texto variante="saudacao" numberOfLines={1}>{saudacao}</Texto>
        </View>
    );
}

const estilos = StyleSheet.create({
    saudacao: { gap: 4 },
});
