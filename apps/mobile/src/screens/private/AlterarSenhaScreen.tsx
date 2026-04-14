import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useMutation } from '@tanstack/react-query';
import { useORPC } from '../../locomotiva-api/context';
import { usePrivateStackNavigation } from '../../navigation/PrivateNavigator';

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

    const newPasswordError = newPassword && newPassword.length < 8
        ? 'Mínimo 8 caracteres'
        : null;

    const canSubmit =
        currentPassword.length > 0 &&
        newPassword.length >= 8 &&
        !newPasswordError &&
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
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text variant="titleMedium" style={styles.sectionTitle}>
                Alterar senha
            </Text>

            <TextInput
                label="Senha atual"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                mode="outlined"
                secureTextEntry={!showCurrent}
                right={
                    <TextInput.Icon
                        icon={showCurrent ? 'eye-off' : 'eye'}
                        onPress={() => setShowCurrent((v) => !v)}
                    />
                }
                style={styles.input}
            />

            <TextInput
                label="Nova senha"
                value={newPassword}
                onChangeText={setNewPassword}
                mode="outlined"
                secureTextEntry={!showNew}
                error={!!newPasswordError}
                right={
                    <TextInput.Icon
                        icon={showNew ? 'eye-off' : 'eye'}
                        onPress={() => setShowNew((v) => !v)}
                    />
                }
                style={styles.input}
            />
            {newPasswordError && <HelperText type="error">{newPasswordError}</HelperText>}

            <TextInput
                label="Confirmar nova senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showConfirm}
                error={!!confirmError}
                right={
                    <TextInput.Icon
                        icon={showConfirm ? 'eye-off' : 'eye'}
                        onPress={() => setShowConfirm((v) => !v)}
                    />
                }
                style={styles.input}
            />
            {confirmError && <HelperText type="error">{confirmError}</HelperText>}

            {error && (
                <HelperText type="error" style={styles.globalError}>
                    {error}
                </HelperText>
            )}

            <View style={styles.actions}>
                <Button
                    mode="outlined"
                    onPress={() => navigation.goBack()}
                    style={styles.cancelButton}
                    disabled={changePasswordMutation.isPending}
                >
                    Cancelar
                </Button>
                <Button
                    mode="contained"
                    onPress={handleSave}
                    loading={changePasswordMutation.isPending}
                    disabled={!canSubmit || changePasswordMutation.isPending}
                    style={styles.saveButton}
                >
                    Salvar
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        gap: 4,
    },
    sectionTitle: {
        marginBottom: 12,
        opacity: 0.7,
    },
    input: {
        marginBottom: 2,
    },
    globalError: {
        marginTop: 8,
        fontSize: 14,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    cancelButton: {
        flex: 1,
    },
    saveButton: {
        flex: 1,
    },
});
