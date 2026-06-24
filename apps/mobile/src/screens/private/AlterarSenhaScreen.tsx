import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text, TextInput, Button, HelperText, Surface, Icon } from 'react-native-paper';
import { useMutation } from '@tanstack/react-query';
import { useORPC } from '../../locomotiva-api/context';
import { usePrivateStackNavigation } from '../../navigation/PrivateNavigator';
import { PrimaryButton } from '../../design/components';
import { colors, spacing, radius, typography } from '../../design/tokens';

export default function AlterarSenhaScreen() {
    const orpc = useORPC();
    const navigation = usePrivateStackNavigation();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const confirmError = confirmPassword && confirmPassword !== newPassword
        ? 'As senhas não coincidem'
        : null;

    const newPasswordError = newPassword
        ? newPassword.length < 8
            ? 'A senha deve ter pelo menos 8 caracteres.'
            : !/[A-Z]/.test(newPassword)
                ? 'A senha deve conter pelo menos uma letra maiúscula.'
                : !/[0-9]/.test(newPassword)
                    ? 'A senha deve conter pelo menos um número.'
                    : !/[^A-Za-z0-9]/.test(newPassword)
                        ? 'A senha deve conter pelo menos um símbolo.'
                        : null
        : null;

    const canSubmit =
        currentPassword.length > 0 &&
        !newPasswordError &&
        newPassword.length > 0 &&
        !confirmError &&
        confirmPassword === newPassword;

    const changePasswordMutation = useMutation({
        ...orpc.identy.changePassword.mutationOptions(),
        onSuccess: () => {
            navigation.goBack();
        },
        onError: (e: any) => {
            setError(e?.message ?? 'Erro ao alterar senha. Verifique a senha atual.');
        },
    });

    async function handleSave() {
        if (!canSubmit) return;
        setError(null);
        changePasswordMutation.mutate({ currentPassword, newPassword });
    }

    return (
        <KeyboardAwareScrollView
            style={styles.screen}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            extraScrollHeight={20}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Surface style={styles.iconBadge} elevation={0}>
                    <Icon source="shield-key-outline" size={32} color={colors.text.onBrand} />
                </Surface>
                <Text style={styles.title}>Alterar senha</Text>
                <Text style={styles.subtitle}>
                    Confirme sua senha atual e defina uma nova senha de acesso.
                </Text>
            </View>

            <Surface style={styles.card} elevation={0}>
                <Text style={styles.label}>Senha atual</Text>
                <TextInput
                    placeholder="Digite sua senha atual"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    mode="outlined"
                    secureTextEntry={!showCurrent}
                    left={<TextInput.Icon icon="lock" color={colors.text.muted} />}
                    right={
                        <TextInput.Icon
                            icon={showCurrent ? 'eye-off' : 'eye'}
                            color={colors.text.muted}
                            onPress={() => setShowCurrent((v) => !v)}
                        />
                    }
                    outlineColor={colors.border.subtle}
                    activeOutlineColor={colors.brand.blue}
                    textColor={colors.text.primary}
                    placeholderTextColor={colors.text.muted}
                    outlineStyle={styles.outline}
                    style={styles.input}
                />

                <Text style={[styles.label, styles.labelSpaced]}>Nova senha</Text>
                <TextInput
                    placeholder="Digite a nova senha"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    mode="outlined"
                    secureTextEntry={!showNew}
                    error={!!newPasswordError}
                    left={<TextInput.Icon icon="lock" color={colors.text.muted} />}
                    right={
                        <TextInput.Icon
                            icon={showNew ? 'eye-off' : 'eye'}
                            color={colors.text.muted}
                            onPress={() => setShowNew((v) => !v)}
                        />
                    }
                    outlineColor={colors.border.subtle}
                    activeOutlineColor={colors.brand.blue}
                    textColor={colors.text.primary}
                    placeholderTextColor={colors.text.muted}
                    outlineStyle={styles.outline}
                    style={styles.input}
                />
                {newPasswordError
                    ? <HelperText type="error" visible={true} style={styles.helper}>{newPasswordError}</HelperText>
                    : <HelperText type="info" visible={true} style={[styles.helper, styles.infoText]}>
                        Mínimo 8 caracteres, uma letra maiúscula, um número e um símbolo.
                      </HelperText>
                }

                <Text style={[styles.label, styles.labelSpaced]}>Confirmar nova senha</Text>
                <TextInput
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    mode="outlined"
                    secureTextEntry={!showConfirm}
                    error={!!confirmError}
                    left={<TextInput.Icon icon="lock-check" color={colors.text.muted} />}
                    right={
                        <TextInput.Icon
                            icon={showConfirm ? 'eye-off' : 'eye'}
                            color={colors.text.muted}
                            onPress={() => setShowConfirm((v) => !v)}
                        />
                    }
                    outlineColor={colors.border.subtle}
                    activeOutlineColor={colors.brand.blue}
                    textColor={colors.text.primary}
                    placeholderTextColor={colors.text.muted}
                    outlineStyle={styles.outline}
                    style={styles.input}
                />
                {confirmError && <HelperText type="error" visible={true} style={styles.helper}>{confirmError}</HelperText>}

                {error && (
                    <Text style={styles.globalError}>{error}</Text>
                )}

                <View style={styles.actions}>
                    <Button
                        mode="outlined"
                        onPress={() => navigation.goBack()}
                        style={styles.cancelButton}
                        textColor={colors.brand.navy}
                        labelStyle={styles.cancelLabel}
                        disabled={changePasswordMutation.isPending}
                    >
                        Cancelar
                    </Button>
                    <View style={styles.saveButton}>
                        <PrimaryButton
                            onPress={handleSave}
                            loading={changePasswordMutation.isPending}
                            disabled={!canSubmit || changePasswordMutation.isPending}
                        >
                            Salvar
                        </PrimaryButton>
                    </View>
                </View>
            </Surface>
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.surface.background,
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    iconBadge: {
        width: 64,
        height: 64,
        borderRadius: radius.lg,
        backgroundColor: colors.brand.navy,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.base,
    },
    title: {
        fontFamily: typography.family,
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
        fontSize: typography.size.xxl,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontFamily: typography.family,
        color: colors.text.secondary,
        fontSize: typography.size.base,
        lineHeight: 22,
        textAlign: 'center',
        paddingHorizontal: spacing.sm,
    },
    card: {
        backgroundColor: colors.surface.card,
        borderRadius: radius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border.subtle,
    },
    label: {
        fontFamily: typography.family,
        fontWeight: typography.weight.semibold,
        color: colors.text.primary,
        fontSize: typography.size.base,
        marginBottom: spacing.sm,
    },
    labelSpaced: {
        marginTop: spacing.base,
    },
    input: {
        backgroundColor: colors.surface.card,
        fontSize: typography.size.md,
    },
    outline: {
        borderRadius: radius.md,
    },
    helper: {
        paddingHorizontal: 0,
        paddingTop: spacing.xs,
    },
    infoText: {
        color: colors.text.muted,
        fontSize: typography.size.xs,
    },
    globalError: {
        fontFamily: typography.family,
        color: colors.feedback.error,
        backgroundColor: '#FEF2F2',
        borderRadius: radius.sm,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.base,
        textAlign: 'center',
        fontWeight: typography.weight.semibold,
        marginTop: spacing.base,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.lg,
        alignItems: 'center',
    },
    cancelButton: {
        flex: 1,
        borderRadius: radius.md,
        borderColor: colors.border.strong,
    },
    cancelLabel: {
        fontFamily: typography.family,
        fontSize: typography.size.base,
        fontWeight: typography.weight.semibold,
        paddingVertical: spacing.xs,
    },
    saveButton: {
        flex: 1,
    },
});
