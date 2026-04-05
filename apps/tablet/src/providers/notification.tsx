import React, { FC, PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { NotificationContext } from "../contexts/notification";
import { useORPC } from "../locomotiva-api/context";

const CHECKIN_SOUND = require('../../assets/checkin-sound.wav')

export async function playCheckinSound() {
    try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true })
        const { sound } = await Audio.Sound.createAsync(CHECKIN_SOUND)
        await sound.setVolumeAsync(0.6)
        await sound.playAsync()
        sound.setOnPlaybackStatusUpdate((status) => {
            if ('didJustFinish' in status && status.didJustFinish) {
                sound.unloadAsync()
            }
        })
    } catch { /* ignorar erros de áudio */ }
}

export const NotificationProvider: FC<PropsWithChildren> = ({ children }) => {
    const orpc = useORPC()
    const [visible, setVisible] = useState(false)
    const slideAnim = useRef(new Animated.Value(-120)).current
    const animRef = useRef<Animated.CompositeAnimation | null>(null)

    const showCheckinNotification = useCallback(() => {
        playCheckinSound().catch(() => {})

        // Se já estiver mostrando, reinicia a animação
        if (animRef.current) animRef.current.stop()
        slideAnim.setValue(-120)
        setVisible(true)

        animRef.current = Animated.sequence([
            Animated.spring(slideAnim, {
                toValue: 36,
                useNativeDriver: true,
                tension: 65,
                friction: 9,
            }),
            Animated.delay(2400),
            Animated.timing(slideAnim, {
                toValue: -120,
                duration: 320,
                useNativeDriver: true,
            }),
        ])
        animRef.current.start(({ finished }) => {
            if (finished) setVisible(false)
        })
    }, [slideAnim])

    useEffect(() => {
        let cancelled = false
        let abortController: AbortController | null = null

        async function connect() {
            while (!cancelled) {
                try {
                    abortController = new AbortController()
                    console.log("Notification connecting...")
                    const events = await (orpc.coworking.totem.onCheckin as any).call(
                        { totemName: "tomate" },
                        { signal: abortController.signal }
                    )
                    console.log("Notification connected")
                    for await (const _ of events) {
                        showCheckinNotification()
                    }
                } catch (error: any) {
                    if (!cancelled) console.error("Notification error:", error)
                }
                if (!cancelled) {
                    await new Promise(resolve => setTimeout(resolve, 3000))
                    console.log("Notification reconnecting...")
                }
            }
        }

        connect()
        return () => {
            cancelled = true
            abortController?.abort()
        }
    }, [])

    return (
        <NotificationContext.Provider value={{ showCheckinNotification }}>
            <View style={s.wrapper}>
                {children}
                {visible && (
                    <Animated.View
                        style={[s.toastWrapper, { transform: [{ translateY: slideAnim }] }]}
                        pointerEvents="none"
                    >
                        <View style={s.toast}>
                            <MaterialCommunityIcons name="check-circle" size={22} color="white" />
                            <Text style={s.toastText}>Check-in realizado com sucesso!</Text>
                        </View>
                    </Animated.View>
                )}
            </View>
        </NotificationContext.Provider>
    )
}

const s = StyleSheet.create({
    wrapper: { flex: 1 },
    toastWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
    },
    toast: {
        backgroundColor: '#16A34A',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 14,
        elevation: 12,
    },
    toastText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.2,
    },
})
