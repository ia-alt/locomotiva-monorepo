import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { HORARIO_FUNCIONAMENTO } from '../constants/espaco';
import { LinhaDeInformacao } from '../ui';

/**
 * Dias e horário de funcionamento do hub, no formato das linhas de
 * informação: discreto sobre o chão e igual às outras linhas dentro de um cartão.
 */
export function HorarioFuncionamentoCard({ style }: { style?: StyleProp<ViewStyle> }) {
    return (
        <View style={style}>
            <LinhaDeInformacao
                icone="relogio"
                rotulo={HORARIO_FUNCIONAMENTO.titulo}
                valor={`${HORARIO_FUNCIONAMENTO.dias}, das ${HORARIO_FUNCIONAMENTO.horas}`}
            />
        </View>
    );
}
