import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

type Props = {
    onScan: (code: string) => void
}

export function CameraView({ onScan: _ }: Props) {
    return (
        <View style={s.container}>
            <Text style={s.text}>Leitor de QR Code não disponível nesta plataforma.</Text>
        </View>
    )
}

const s = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    text: { color: '#fff', fontSize: 16 },
})
