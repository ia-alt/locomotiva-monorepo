import React, { useState } from 'react'
import { View, StyleSheet, useWindowDimensions } from 'react-native'
import { Text, TextInput, Button, HelperText, Surface } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LS_API_KEY } from '../locomotiva-api/link'
import { useORPC } from '../locomotiva-api/context'

export const LS_TABLET_MODE = 'locomotiva_tablet_mode'

type Mode = 'checkin' | 'checkout'

type Props = {
    onConfigured: (mode: Mode) => void
}

export default function SetupScreen({ onConfigured }: Props) {
    const { width, height } = useWindowDimensions()
    const orpc = useORPC()

    const [selectedMode, setSelectedMode] = useState<Mode | null>(null)
    const [apiKey, setApiKey] = useState('')
    const [isValidating, setIsValidating] = useState(false)
    const [error, setError] = useState('')
    const [validatedName, setValidatedName] = useState('')

    const cardW = Math.min(520, width * 0.6)
    const titleFs = Math.max(20, Math.min(30, height * 0.038))
    const subFs = Math.max(12, Math.min(16, height * 0.02))

    async function handleConfirm() {
        if (!selectedMode) {
            setError('Selecione uma operação antes de continuar.')
            return
        }
        if (!apiKey.trim()) {
            setError('Informe a API Key do totem.')
            return
        }

        setError('')
        setIsValidating(true)

        try {
            // Salva temporariamente para o link conseguir enviar no header
            await AsyncStorage.setItem(LS_API_KEY, apiKey.trim())

            const result = await (orpc.identy.getApiKeyInfo as any).call({})

            // Chave válida — persiste o modo e exibe o nome
            await AsyncStorage.setItem(LS_TABLET_MODE, selectedMode)
            setValidatedName(result.name)

            // Pequeno delay para o usuário ver a confirmação
            setTimeout(() => onConfigured(selectedMode), 1500)
        } catch {
            await AsyncStorage.removeItem(LS_API_KEY)
            setError('API Key inválida ou servidor inacessível. Verifique e tente novamente.')
        } finally {
            setIsValidating(false)
        }
    }

    return (
        <View style={s.root}>
            <Surface style={[s.card, { width: cardW }]} elevation={4}>
                <MaterialCommunityIcons name="tablet" size={48} color="#1A7BFF" style={{ marginBottom: 12 }} />
                <Text style={[s.title, { fontSize: titleFs }]}>Configuração do Totem</Text>
                <Text style={[s.sub, { fontSize: subFs }]}>
                    Selecione a operação e informe a API Key para ativar este totem.
                </Text>

                {/* Seleção de modo */}
                <Text style={s.label}>Operação</Text>
                <View style={s.modeRow}>
                    <ModeButton
                        label="Check-in"
                        icon="login"
                        color="#1A7BFF"
                        selected={selectedMode === 'checkin'}
                        onPress={() => setSelectedMode('checkin')}
                    />
                    <ModeButton
                        label="Check-out"
                        icon="logout"
                        color="#0F9B6E"
                        selected={selectedMode === 'checkout'}
                        onPress={() => setSelectedMode('checkout')}
                    />
                </View>

                {/* API Key */}
                <Text style={[s.label, { marginTop: 20 }]}>API Key</Text>
                <TextInput
                    mode="outlined"
                    label="Cole ou digite a API Key"
                    value={apiKey}
                    onChangeText={(v) => { setApiKey(v); setError('') }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
                    left={<TextInput.Icon icon="key-outline" />}
                    error={!!error}
                    style={s.input}
                />
                {!!error && <HelperText type="error" visible>{error}</HelperText>}

                {/* Feedback de sucesso */}
                {!!validatedName && (
                    <View style={s.successBadge}>
                        <MaterialCommunityIcons name="check-circle" size={18} color="#16A34A" />
                        <Text style={s.successText}>Totem: {validatedName}</Text>
                    </View>
                )}

                <Button
                    mode="contained"
                    buttonColor="#1A7BFF"
                    onPress={handleConfirm}
                    loading={isValidating}
                    disabled={isValidating}
                    icon="arrow-right"
                    contentStyle={{ paddingVertical: 8, flexDirection: 'row-reverse' }}
                    labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                    style={s.btn}
                >
                    Confirmar e Ativar
                </Button>
            </Surface>
        </View>
    )
}

function ModeButton({
    label, icon, color, selected, onPress,
}: {
    label: string
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']
    color: string
    selected: boolean
    onPress: () => void
}) {
    return (
        <Button
            mode={selected ? 'contained' : 'outlined'}
            buttonColor={selected ? color : undefined}
            textColor={selected ? 'white' : color}
            icon={icon}
            onPress={onPress}
            style={[s.modeBtn, { borderColor: color }]}
            contentStyle={{ paddingVertical: 10, paddingHorizontal: 8 }}
            labelStyle={{ fontSize: 15, fontWeight: 'bold' }}
        >
            {label}
        </Button>
    )
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F3F6FA', justifyContent: 'center', alignItems: 'center' },
    card: { borderRadius: 20, padding: 36, backgroundColor: 'white', alignItems: 'center' },
    title: { fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
    sub: { color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
    label: { alignSelf: 'flex-start', fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 },
    modeRow: { flexDirection: 'row', gap: 16, width: '100%' },
    modeBtn: { flex: 1, borderRadius: 10, borderWidth: 2 },
    input: { width: '100%', marginBottom: 4 },
    btn: { marginTop: 24, borderRadius: 10, width: '100%' },
    successBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, alignSelf: 'flex-start' },
    successText: { fontSize: 14, color: '#16A34A', fontWeight: '600' },
})
