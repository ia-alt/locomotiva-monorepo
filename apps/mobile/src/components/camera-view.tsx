import React, { useRef } from 'react'
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native'
import { CameraView as CameraDoExpo, useCameraPermissions } from 'expo-camera'
import { Botao, Texto, cores, espaco } from '../ui'

type Props = {
    onScan: (code: string) => void
}

/**
 * Leitor de QR code no aplicativo (Android e iOS), com a câmera traseira.
 * A versão web fica em `camera-view.web.tsx`. A moldura da área de leitura e
 * o botão de fechar vêm do modal em `contexts/qr-code-reader.tsx`.
 */
export function CameraView({ onScan }: Props) {
    const [permissao, pedirPermissao] = useCameraPermissions()
    // A câmera continua mandando leituras enquanto o modal fecha: só a primeira vale.
    const jaLeu = useRef(false)

    if (!permissao) {
        return (
            <View style={estilos.centro}>
                <ActivityIndicator color={cores.papel} accessibilityLabel="Preparando a câmera" />
            </View>
        )
    }

    if (!permissao.granted) {
        // Se a pessoa negou de vez, o sistema não pergunta de novo: só pelos ajustes.
        const soNosAjustes = !permissao.canAskAgain
        // Embaixo da tela: o meio fica com a moldura de leitura do modal.
        return (
            <View style={[estilos.centro, estilos.pedido]}>
                <Texto variante="secao" cor={cores.papel} style={estilos.centralizado}>
                    Precisamos da câmera
                </Texto>
                <Texto variante="corpo" cor={cores.papel} style={estilos.centralizado}>
                    {soNosAjustes
                        ? 'O acesso à câmera foi negado. Libere nos ajustes do celular para ler o QR code da recepção.'
                        : 'Para fazer o check-in, o app lê o QR code da recepção com a câmera.'}
                </Texto>
                <Botao
                    titulo={soNosAjustes ? 'Abrir ajustes' : 'Permitir câmera'}
                    onPress={soNosAjustes ? () => Linking.openSettings() : pedirPermissao}
                />
            </View>
        )
    }

    return (
        <CameraDoExpo
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={({ data }) => {
                if (jaLeu.current || !data) return
                jaLeu.current = true
                onScan(data)
            }}
        />
    )
}

const estilos = StyleSheet.create({
    centro: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: espaco.l,
        paddingHorizontal: espaco.xxl,
    },
    pedido: { justifyContent: 'flex-end', paddingBottom: 56 },
    centralizado: { textAlign: 'center' },
})
