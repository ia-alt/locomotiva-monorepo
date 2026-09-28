import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import ScrollComTeclado from '../../components/ScrollComTeclado';
import { useMutation } from '@tanstack/react-query';
import { useORPC } from '../../locomotiva-api/context';
import { usePrivateStackNavigation } from '../../navigation/PrivateNavigator';
import { Aviso, Botao, Campo, cores, espaco } from '../../ui';

export default function AlterarSenhaScreen() {
    const orpc = useORPC();
    const navigation = usePrivateStackNavigation();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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
        <ScrollComTeclado style={estilos.tela} contentContainerStyle={estilos.conteudo}>
            {/* O título "Alterar Senha" já está no cabeçalho da pilha. */}
            <Campo
                rotulo="Senha atual"
                senha
                value={currentPassword}
                onChangeText={setCurrentPassword}
            />

            <Campo
                rotulo="Nova senha"
                senha
                value={newPassword}
                onChangeText={setNewPassword}
                erro={newPasswordError ?? undefined}
            />

            <Campo
                rotulo="Confirmar nova senha"
                senha
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                erro={confirmError ?? undefined}
            />

            {error ? <Aviso tom="erro">{error}</Aviso> : null}

            <View style={estilos.acoes}>
                <View style={estilos.acao}>
                    <Botao
                        titulo="Cancelar"
                        variante="contorno"
                        onPress={() => navigation.goBack()}
                        desabilitado={changePasswordMutation.isPending}
                    />
                </View>
                <View style={estilos.acao}>
                    <Botao
                        titulo="Salvar"
                        onPress={handleSave}
                        carregando={changePasswordMutation.isPending}
                        desabilitado={!canSubmit || changePasswordMutation.isPending}
                    />
                </View>
            </View>
        </ScrollComTeclado>
    );
}

const estilos = StyleSheet.create({
    tela: { flex: 1, backgroundColor: cores.chao },
    conteudo: {
        gap: espaco.l,
        paddingHorizontal: espaco.l,
        paddingTop: espaco.s,
        paddingBottom: espaco.xxl,
    },
    acoes: { flexDirection: 'row', gap: espaco.m, marginTop: espaco.s },
    acao: { flex: 1 },
});
