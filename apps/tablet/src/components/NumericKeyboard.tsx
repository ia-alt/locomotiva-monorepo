import React from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { Text } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'

type Props = {
    onPress: (key: string) => void
    onDelete: () => void
    color: string
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

export function NumericKeyboard({ onPress, onDelete, color }: Props) {
    return (
        <View style={s.container}>
            <View style={s.grid}>
                {KEYS.map((k) => (
                    <Pressable
                        key={k}
                        style={({ pressed }) => [s.key, pressed && s.keyPressed]}
                        onPress={() => onPress(k)}
                    >
                        <Text style={s.keyText}>{k}</Text>
                    </Pressable>
                ))}

                {/* Linha inferior: vazio | 0 | apagar */}
                <View style={s.keyEmpty} />
                <Pressable
                    style={({ pressed }) => [s.key, pressed && s.keyPressed]}
                    onPress={() => onPress('0')}
                >
                    <Text style={s.keyText}>0</Text>
                </Pressable>
                <Pressable
                    style={({ pressed }) => [s.keyDelete, { backgroundColor: color }, pressed && s.keyDeletePressed]}
                    onPress={onDelete}
                >
                    <MaterialCommunityIcons name="backspace-outline" size={22} color="white" />
                </Pressable>
            </View>
        </View>
    )
}

const s = StyleSheet.create({
    container: {
        marginTop: 12,
        alignItems: 'center',
    },
    grid: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    key: {
        width: '30%',
        flexShrink: 1,
        paddingVertical: 14,
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 1,
    },
    keyPressed: {
        backgroundColor: '#CBD5E1',
    },
    keyText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#1E293B',
    },
    keyEmpty: {
        width: '30%',
    },
    keyDelete: {
        width: '30%',
        flexShrink: 1,
        paddingVertical: 9,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 1,
    },
    keyDeletePressed: {
        opacity: 0.75,
    },
})
