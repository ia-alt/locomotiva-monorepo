import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera'

type Props = {
    onScan: (code: string) => void
}

export function CameraView({ onScan }: Props) {
    const [permission, requestPermission] = useCameraPermissions()

    useEffect(() => {
        if (permission && !permission.granted) {
            requestPermission()
        }
    }, [permission])

    if (!permission) return <View style={s.container} />

    if (!permission.granted) {
        return (
            <View style={s.container}>
                <Text style={s.text}>Permissão de câmera negada.</Text>
            </View>
        )
    }

    return (
        <ExpoCameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            onBarcodeScanned={({ data }) => onScan(data)}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
    )
}

const s = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    text: { color: '#fff', fontSize: 16 },
})
