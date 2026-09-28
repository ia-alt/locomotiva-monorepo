import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import ScrollComTeclado from '../../components/ScrollComTeclado';
import { useAuth } from '../../contexts/auth-context';
import { usePrivateStackNavigation } from '../../navigation/PrivateNavigator';
import { Aviso, Botao, Campo, Texto, cores, espaco } from '../../ui';
import { MENSAGENS, dataDeNascimentoValida, dataParaApi, dataParaExibir, mascaraDeData, telefoneCompleto } from '../../utils/validacoes';

function applyPhoneMask(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
        return digits
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    }
    return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

export default function EditarPerfilScreen() {
    const { authUser, updateMe } = useAuth();
    const navigation = usePrivateStackNavigation();

    const [name, setName] = useState(authUser?.name ?? '');
    const [birthDate, setBirthDate] = useState(dataParaExibir(authUser?.birthDate));
    const [email, setEmail] = useState(authUser?.email ?? '');
    const [phone, setPhone] = useState(applyPhoneMask(authUser?.phone ?? ''));
    const [company, setCompany] = useState(authUser?.company ?? '');
    const [jobTitle, setJobTitle] = useState(authUser?.jobTitle ?? '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const nameError = name.trim().length === 0 ? 'Nome é obrigatório' : null;
    const emailError = !email.includes('@') ? 'E-mail inválido' : null;
    // A data de nascimento é obrigatória no cadastro: sem ela o salvar ficaria
    // mandando uma data vazia (inválida) para a API.
    const birthDateError = !birthDate
        ? MENSAGENS.dataDeNascimentoObrigatoria
        : !dataDeNascimentoValida(birthDate) ? MENSAGENS.dataDeNascimento : null;
    const phoneError = !telefoneCompleto(phone) ? MENSAGENS.telefone : null;

    const canSubmit = !nameError && !emailError && !birthDateError && !phoneError && !loading;

    async function handleSave() {
        if (!canSubmit) return;
        setError(null);
        setLoading(true);
        try {
            await updateMe({
                name: name.trim(),
                email,
                birthDate: dataParaApi(birthDate),
                phone,
                company: company || null,
                jobTitle: jobTitle || null
            });
            navigation.goBack();
        } catch (e: any) {
            setError(e?.message ?? 'Erro ao salvar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollComTeclado style={estilos.tela} contentContainerStyle={estilos.conteudo}>
            <Texto variante="secao" accessibilityRole="header">Dados pessoais</Texto>

            <Campo
                rotulo="Nome completo"
                value={name}
                onChangeText={setName}
                erro={nameError ?? undefined}
            />

            <Campo
                rotulo="Data de nascimento"
                value={birthDate}
                onChangeText={(v) => setBirthDate(mascaraDeData(v))}
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                erro={birthDateError ?? undefined}
            />

            <Campo
                rotulo="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                erro={emailError ?? undefined}
            />

            <Campo
                rotulo="Telefone"
                value={phone}
                onChangeText={(v) => setPhone(applyPhoneMask(v))}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                maxLength={15}
                erro={phoneError ?? undefined}
            />

            <Campo
                rotulo="Empresa/Instituição (opcional)"
                value={company}
                onChangeText={setCompany}
            />

            <Campo
                rotulo="Cargo (opcional)"
                value={jobTitle}
                onChangeText={setJobTitle}
            />

            {error ? <Aviso tom="erro">{error}</Aviso> : null}

            <View style={estilos.acoes}>
                <View style={estilos.acao}>
                    <Botao
                        titulo="Cancelar"
                        variante="contorno"
                        onPress={() => navigation.goBack()}
                        desabilitado={loading}
                    />
                </View>
                <View style={estilos.acao}>
                    <Botao
                        titulo="Salvar"
                        onPress={handleSave}
                        carregando={loading}
                        desabilitado={!canSubmit}
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
