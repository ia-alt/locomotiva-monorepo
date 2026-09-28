import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import { Modal, View, StyleSheet, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CameraView } from '../components/camera-view'
import { ALVO_DE_TOQUE, Icone, cores, espaco, raio } from '../ui'

type QRCodeReaderContextType = {
    openReader(onCodeReaded: (code: string) => void): void
}

const QRCodeReaderContext = createContext<QRCodeReaderContextType | undefined>(undefined)

export function QRCodeReaderProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const callbackRef = useRef<((code: string) => void) | null>(null)

    const openReader = useCallback((onCodeReaded: (code: string) => void) => {
        callbackRef.current = onCodeReaded
        setIsOpen(true)
    }, [])

    const handleScan = useCallback((code: string) => {
        setIsOpen(false)
        callbackRef.current?.(code)
        callbackRef.current = null
    }, [])

    const handleClose = useCallback(() => {
        setIsOpen(false)
        callbackRef.current = null
    }, [])

    return (
        <QRCodeReaderContext.Provider value={{ openReader }}>
            {children}
            <Modal
                visible={isOpen}
                animationType="slide"
                statusBarTranslucent
                onRequestClose={handleClose}
            >
                <TelaDoLeitor onScan={handleScan} onClose={handleClose} />
            </Modal>
        </QRCodeReaderContext.Provider>
    )
}

export function useQRCodeReader() {
    const ctx = useContext(QRCodeReaderContext)
    if (!ctx) throw new Error('useQRCodeReader deve ser usado dentro de QRCodeReaderProvider')
    return ctx
}

/** Câmera em tela cheia, com os cantos amarelos marcando onde enquadrar o QR code. */
function TelaDoLeitor({ onScan, onClose }: { onScan: (code: string) => void; onClose: () => void }) {
    // O modal cobre a barra de status, então o botão de fechar desce o tanto que ela ocupa.
    const insets = useSafeAreaInsets()

    return (
        <View style={s.container}>
            <CameraView onScan={onScan} />

            <View style={s.overlay}>
                <View style={s.scanArea}>
                    <View style={[s.canto, s.cantoSuperiorEsquerdo]} />
                    <View style={[s.canto, s.cantoSuperiorDireito]} />
                    <View style={[s.canto, s.cantoInferiorEsquerdo]} />
                    <View style={[s.canto, s.cantoInferiorDireito]} />
                </View>
            </View>

            <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Fechar leitor de QR code"
                hitSlop={8}
                style={({ pressed }) => [
                    s.closeButton,
                    { top: insets.top + espaco.m },
                    pressed && s.closeButtonPressionado,
                ]}
            >
                <Icone nome="fechar" cor={cores.papel} />
            </Pressable>
        </View>
    )
}

const SCAN_SIZE = 260
const TAMANHO_DO_CANTO = 44
const ESPESSURA_DO_CANTO = 4

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: cores.painel.fundo,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
    },
    scanArea: {
        width: SCAN_SIZE,
        height: SCAN_SIZE,
    },
    canto: {
        position: 'absolute',
        width: TAMANHO_DO_CANTO,
        height: TAMANHO_DO_CANTO,
        borderColor: cores.amarelo,
    },
    cantoSuperiorEsquerdo: {
        top: 0,
        left: 0,
        borderTopWidth: ESPESSURA_DO_CANTO,
        borderLeftWidth: ESPESSURA_DO_CANTO,
        borderTopLeftRadius: raio.cartao,
    },
    cantoSuperiorDireito: {
        top: 0,
        right: 0,
        borderTopWidth: ESPESSURA_DO_CANTO,
        borderRightWidth: ESPESSURA_DO_CANTO,
        borderTopRightRadius: raio.cartao,
    },
    cantoInferiorEsquerdo: {
        bottom: 0,
        left: 0,
        borderBottomWidth: ESPESSURA_DO_CANTO,
        borderLeftWidth: ESPESSURA_DO_CANTO,
        borderBottomLeftRadius: raio.cartao,
    },
    cantoInferiorDireito: {
        bottom: 0,
        right: 0,
        borderBottomWidth: ESPESSURA_DO_CANTO,
        borderRightWidth: ESPESSURA_DO_CANTO,
        borderBottomRightRadius: raio.cartao,
    },
    closeButton: {
        position: 'absolute',
        right: espaco.l,
        width: ALVO_DE_TOQUE,
        height: ALVO_DE_TOQUE,
        borderRadius: ALVO_DE_TOQUE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: cores.painel.fundo,
    },
    closeButtonPressionado: {
        backgroundColor: cores.painel.flapTopo,
    },
})
