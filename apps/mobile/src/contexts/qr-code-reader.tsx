import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import { Modal, View, StyleSheet, Pressable } from 'react-native'
import { IconButton } from 'react-native-paper'
import { CameraView } from '../components/camera-view'

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
                <View style={s.container}>
                    <CameraView onScan={handleScan} />

                    <View style={s.overlay}>
                        <View style={s.scanArea} />
                    </View>

                    <IconButton
                        icon="close"
                        iconColor="#fff"
                        size={28}
                        style={s.closeButton}
                        onPress={handleClose}
                    />
                </View>
            </Modal>
        </QRCodeReaderContext.Provider>
    )
}

export function useQRCodeReader() {
    const ctx = useContext(QRCodeReaderContext)
    if (!ctx) throw new Error('useQRCodeReader deve ser usado dentro de QRCodeReaderProvider')
    return ctx
}

const SCAN_SIZE = 260

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
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
        borderRadius: 16,
        borderWidth: 3,
        borderColor: '#1A7BFF',
    },
    closeButton: {
        position: 'absolute',
        top: 48,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
})
