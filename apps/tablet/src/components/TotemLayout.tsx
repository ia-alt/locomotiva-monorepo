import React from 'react'
import { View, StyleSheet, Image, Pressable, useWindowDimensions } from 'react-native'
import { Text, TextInput, Button, Surface, HelperText } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTotemFlow, UseTotemFlowParams } from '../hooks/useTotemFlow'

const LOGO_LOCOMOTIVA = { uri: '/locomotiva_logo-.png' }
const LOGO_INOVA = { uri: '/inova%20logo.avif' }
const LOGO_GOVERNO = { uri: '/governo%20do%20maranhao.avif' }
const QR_CODE = { uri: '/Qr_teste.png' }

export type TotemLayoutProps = UseTotemFlowParams & {
    color: string
    apiKeyName?: string
    idleIcon: React.ComponentProps<typeof MaterialCommunityIcons>['name']
    idleTitle: string
    idleSub: string
    idleButtonLabel: string
    submitButtonLabel: string
    submitButtonIcon: React.ComponentProps<typeof MaterialCommunityIcons>['name']
    successTitle: string
    successGreeting: string
    successTimeLabel: string
    countdownPillBg: string
    countdownPillText: string
}

export function TotemLayout({
    color,
    mode,
    mutationFn,
    lookupFn,
    apiKeyName,
    idleIcon,
    idleTitle,
    idleSub,
    idleButtonLabel,
    submitButtonLabel,
    submitButtonIcon,
    successTitle,
    successGreeting,
    successTimeLabel,
    countdownPillBg,
    countdownPillText,
}: TotemLayoutProps) {
    const { width, height } = useWindowDimensions()

    const flow = useTotemFlow({ mode, mutationFn, lookupFn })

    // ── Valores dinâmicos baseados na tela ──────────────────────────────────────
    const logoH = Math.min(180, height * 0.21)
    const govW = Math.min(240, width * 0.14)
    const govH = govW * (94 / 280)
    const inovaW = Math.min(90, width * 0.06)
    const inovaH = inovaW * (40 / 110)
    const qrSz = Math.min(200, height * 0.27)
    const iconSz = Math.max(32, Math.min(56, height * 0.07))
    const titleFs = Math.max(16, Math.min(28, height * 0.035))
    const subFs = Math.max(11, Math.min(15, height * 0.019))
    const qrTitleFs = Math.max(14, Math.min(22, height * 0.028))
    const partnerGap = Math.max(12, Math.min(32, width * 0.02))
    const panelPaddingH = Math.max(20, Math.min(40, width * 0.03))
    const centerPaddingTop = Math.max(30, Math.min(60, height * 0.08))
    const btnFs = Math.max(13, Math.min(18, height * 0.023))
    const btnPadV = Math.max(6, height * 0.012)
    // ───────────────────────────────────────────────────────────────────────────

    // ── IDLE: tela dividida ─────────────────────────────────────────────────────
    if (flow.step === 'idle') {
        return (
            <View style={s.root}>
                {/* LEFT – QR Code */}
                <View style={[s.qrPanel, { paddingHorizontal: panelPaddingH }]}>
                    <Image source={QR_CODE} style={{ width: qrSz, height: qrSz, marginBottom: 24 }} resizeMode="contain" />
                    <Text style={[s.qrTitle, { fontSize: qrTitleFs }]}>Acesse o App Locomotiva</Text>
                    <Text style={[s.qrSub, { fontSize: subFs, lineHeight: subFs * 1.5 }]}>
                        Escaneie o QR Code para se cadastrar,{'\n'}
                        fazer login, reservar salas e muito mais.
                    </Text>
                </View>

                {/* RIGHT – Painel colorido */}
                <View style={[s.actionPanel, { backgroundColor: color, paddingHorizontal: panelPaddingH }]}>
                    {!!apiKeyName && (
                        <View style={s.apiKeyBadge}>
                            <MaterialCommunityIcons name="key-outline" size={11} color="rgba(255,255,255,0.7)" />
                            <Text style={s.apiKeyBadgeText}>{apiKeyName}</Text>
                        </View>
                    )}
                    <Image source={LOGO_LOCOMOTIVA} style={[s.logoTop, { height: logoH }]} resizeMode="contain" tintColor="white" />

                    <View style={[s.centerContent, { paddingTop: centerPaddingTop }]}>
                        <MaterialCommunityIcons name={idleIcon} size={iconSz} color="rgba(255,255,255,0.9)" style={{ marginBottom: 16 }} />
                        <Text style={[s.idleTitle, { fontSize: titleFs, lineHeight: titleFs * 1.3 }]}>{idleTitle}</Text>
                        <Text style={[s.idleSub, { fontSize: subFs, lineHeight: subFs * 1.5 }]}>{idleSub}</Text>
                        <Button
                            mode="contained"
                            buttonColor="white"
                            textColor={color}
                            labelStyle={{ fontSize: btnFs, fontWeight: 'bold' }}
                            contentStyle={{ paddingVertical: btnPadV, paddingHorizontal: 12 }}
                            style={s.idleBtn}
                            icon="card-account-details"
                            onPress={flow.startFlow}
                        >
                            {idleButtonLabel}
                        </Button>
                    </View>

                    <View style={[s.partners, { gap: partnerGap }]}>
                        <Image source={LOGO_INOVA} style={{ width: inovaW, height: inovaH }} resizeMode="contain" />
                        <Image source={LOGO_GOVERNO} style={{ width: govW, height: govH }} resizeMode="contain" />
                    </View>
                </View>

                {/* Modal: CPF não encontrado */}
                {flow.notFoundMessage && (
                    <View style={[StyleSheet.absoluteFill, s.notFoundOverlay, { backdropFilter: 'blur(6px)' } as any]}>
                        <View style={s.notFoundCard}>
                            <MaterialCommunityIcons name="account-alert" size={52} color="#EF4444" />
                            {!!flow.notFoundMessage?.title && (
                                <Text style={s.notFoundTitle}>{flow.notFoundMessage.title}</Text>
                            )}
                            <Text style={s.notFoundMsg}>{flow.notFoundMessage?.body}</Text>
                            <Button
                                mode="contained"
                                buttonColor="#EF4444"
                                onPress={flow.dismissNotFoundModal}
                                style={{ borderRadius: 10, marginTop: 16 }}
                                contentStyle={{ paddingVertical: 6, paddingHorizontal: 16 }}
                                labelStyle={{ fontWeight: 'bold' }}
                            >
                                Fechar
                            </Button>
                        </View>
                    </View>
                )}
            </View>
        )
    }

    // ── EXPANDIDO: painel tela cheia ────────────────────────────────────────────
    return (
        <View style={[s.root, { backgroundColor: color }]}>
            {/* Logo e botão voltar ficam ocultos na tela de sucesso */}
            {flow.step !== 'success' && (
                <Image source={LOGO_LOCOMOTIVA} style={[s.logoTopFull, { height: logoH }]} resizeMode="contain" tintColor="white" />
            )}
            {flow.step !== 'success' && (
                <Pressable style={s.backBtn} onPress={flow.goBack}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
                    <Text style={s.backText}>Voltar</Text>
                </Pressable>
            )}

            <View style={s.expandedCenter}>
                <Surface style={s.card} elevation={5}>

                    {flow.step === 'cpf' && (
                        <View>
                            <Text style={s.cardTitle}>Digite seu CPF</Text>
                            <Text style={s.cardSubtitle}>Informe o CPF cadastrado no sistema</Text>
                            <TextInput
                                ref={flow.cpfRef}
                                mode="outlined"
                                label="CPF"
                                value={flow.cpf}
                                onChangeText={flow.setCpf}
                                keyboardType="number-pad"
                                autoFocus
                                left={<TextInput.Icon icon="card-account-details" />}
                                error={!!flow.fieldError}
                                style={s.input}
                                returnKeyType="next"
                                onSubmitEditing={flow.handleCpfNext}
                            />
                            {flow.fieldError && <HelperText type="error" visible>{flow.fieldError}</HelperText>}
                            <Button
                                mode="contained"
                                buttonColor={color}
                                onPress={flow.handleCpfNext}
                                loading={flow.isLookupPending}
                                disabled={flow.isLookupPending}
                                icon="arrow-right"
                                contentStyle={{ paddingVertical: 8, flexDirection: 'row-reverse' }}
                                labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                                style={s.submitBtn}
                            >
                                Continuar
                            </Button>
                        </View>
                    )}

                    {flow.step === 'birthdate' && (
                        <View>
                            <Text style={s.cardTitle}>Data de Nascimento</Text>
                            <Text style={s.cardSubtitle}>Confirme sua data de nascimento para validar</Text>
                            <TextInput
                                ref={flow.birthDateRef}
                                mode="outlined"
                                label="DD/MM/AAAA"
                                value={flow.birthDate}
                                onChangeText={flow.setBirthDate}
                                keyboardType="number-pad"
                                autoFocus
                                left={<TextInput.Icon icon="calendar" />}
                                error={!!flow.fieldError}
                                style={s.input}
                                returnKeyType="done"
                                onSubmitEditing={flow.handleBirthDateSubmit}
                            />
                            {flow.fieldError && <HelperText type="error" visible>{flow.fieldError}</HelperText>}
                            <Button
                                mode="contained"
                                buttonColor={color}
                                onPress={flow.handleBirthDateSubmit}
                                loading={flow.isPending}
                                disabled={flow.isPending}
                                icon={submitButtonIcon}
                                contentStyle={{ paddingVertical: 8 }}
                                labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                                style={s.submitBtn}
                            >
                                {submitButtonLabel}
                            </Button>
                        </View>
                    )}

                    {flow.step === 'confirm' && (
                        <View style={s.confirmInner}>
                            <MaterialCommunityIcons name={submitButtonIcon} size={56} color={color} />
                            <Text style={s.cardTitle}>Confirmar Saída</Text>
                            <Text style={s.successName}>{flow.pendingUserName}</Text>
                            <Text style={[s.cardSubtitle, { marginTop: 4 }]}>Quer registrar sua saída agora?</Text>
                            <Button
                                mode="contained"
                                buttonColor={color}
                                onPress={flow.handleConfirmSubmit}
                                loading={flow.isPending}
                                disabled={flow.isPending}
                                icon={submitButtonIcon}
                                contentStyle={{ paddingVertical: 10 }}
                                labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
                                style={[s.submitBtn, { marginTop: 20 }]}
                            >
                                Sim
                            </Button>
                        </View>
                    )}

                    {flow.step === 'success' && (
                        <View style={s.successInner}>
                            <MaterialCommunityIcons name="check-circle" size={72} color="#22C55E" />
                            <Text style={s.successTitle}>{successTitle}</Text>
                            <Text style={s.successName}>{successGreeting}{'\n'}{flow.userName}</Text>
                            <Text style={s.successTime}>{successTimeLabel} {flow.recordedTime}</Text>
                            <View style={[s.countdownPill, { backgroundColor: countdownPillBg }]}>
                                <Text style={[s.countdownText, { color: countdownPillText }]}>
                                    Encerrando sessão em {flow.countdown}s
                                </Text>
                            </View>
                            <Button mode="outlined" onPress={flow.resetToIdle} style={s.closeBtn} contentStyle={{ paddingVertical: 4 }}>
                                Fechar
                            </Button>
                        </View>
                    )}

                </Surface>
            </View>

            {flow.step !== 'success' && (
                <View style={[s.partnersFull, { gap: partnerGap }]}>
                    <Image source={LOGO_INOVA} style={{ width: inovaW, height: inovaH }} resizeMode="contain" />
                    <Image source={LOGO_GOVERNO} style={{ width: govW, height: govH }} resizeMode="contain" />
                </View>
            )}
        </View>
    )
}

const s = StyleSheet.create({
    root: { flex: 1, flexDirection: 'row' },

    // ── Painel QR (esquerda) ──
    qrPanel: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
    qrTitle: { fontWeight: 'bold', color: '#1E293B', marginBottom: 10, textAlign: 'center' },
    qrSub: { color: '#64748B', textAlign: 'center' },

    // ── Painel de ação (direita – idle) ──
    actionPanel: { flex: 1, position: 'relative' },
    apiKeyBadge: { position: 'absolute', top: 10, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, zIndex: 2 },
    apiKeyBadgeText: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
    logoTop: { position: 'absolute', top: '6%', left: 0, right: 0, width: undefined, alignSelf: 'center' },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    idleTitle: { color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
    idleSub: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 24 },
    idleBtn: { borderRadius: 16, elevation: 4 },
    partners: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 16 },

    // ── Modal: CPF não encontrado ──
    notFoundOverlay: { backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    notFoundCard: { backgroundColor: 'white', borderRadius: 20, padding: 32, maxWidth: 420, width: '70%', alignItems: 'center', elevation: 10 },
    notFoundTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginTop: 14, marginBottom: 10, textAlign: 'center' },
    notFoundMsg: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },

    // ── Painel expandido (tela cheia) ──
    logoTopFull: { position: 'absolute', top: '6%', left: 0, right: 0, alignSelf: 'center', zIndex: 1 },
    backBtn: { position: 'absolute', top: 24, left: 24, flexDirection: 'row', alignItems: 'center', gap: 6, zIndex: 2 },
    backText: { color: 'white', fontSize: 16, fontWeight: '600' },
    expandedCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 60 },
    card: { width: '100%', maxWidth: 480, borderRadius: 20, padding: 32, backgroundColor: 'white' },
    cardTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', textAlign: 'center', marginBottom: 6 },
    cardSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
    input: { marginBottom: 4 },
    submitBtn: { borderRadius: 10, marginTop: 12 },

    // ── Confirmar (checkout) ──
    confirmInner: { alignItems: 'center', paddingVertical: 8 },

    // ── Sucesso ──
    successInner: { alignItems: 'center', paddingVertical: 8 },
    successTitle: { fontSize: 28, fontWeight: 'bold', color: '#1E293B', marginTop: 16, marginBottom: 8 },
    successName: { fontSize: 18, color: '#475569', textAlign: 'center', marginBottom: 8 },
    successTime: { fontSize: 15, color: '#64748B', marginBottom: 20 },
    countdownPill: { borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20 },
    countdownText: { fontSize: 14, fontWeight: '600' },
    closeBtn: { marginTop: 20, borderRadius: 10 },

    partnersFull: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', zIndex: 1 },
})
