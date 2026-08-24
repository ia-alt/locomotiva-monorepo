import React, { FC } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { HORARIO_FUNCIONAMENTO } from '../constants/espaco';

export const HorarioFuncionamentoCard: FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => (
    <View style={[styles.container, style]}>
        <View style={styles.iconBox}>
            <Feather name="clock" size={18} color="#0284C7" />
        </View>
        <View style={styles.textBox}>
            <Text style={styles.title}>{HORARIO_FUNCIONAMENTO.titulo}</Text>
            <Text style={styles.subtitle}>
                {HORARIO_FUNCIONAMENTO.dias}, das {HORARIO_FUNCIONAMENTO.horas}
            </Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#F0F9FF',
        borderWidth: 1,
        borderColor: '#BAE6FD',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#E0F2FE',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    textBox: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0C4A6E',
    },
    subtitle: {
        fontSize: 13,
        color: '#0369A1',
        marginTop: 2,
    },
});
