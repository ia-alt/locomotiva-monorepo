import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import ScrollComTeclado from '../../../components/ScrollComTeclado';
import { useAuth } from '../../../contexts/auth-context';
import { usePrivateStackNavigation, usePrivateStackRoute } from '../../../navigation/PrivateNavigator';
import { Aviso, Botao, Campo, Icone, Texto, cores, espaco, raio } from '../../../ui';
import { MENSAGENS, dataDeNascimentoValida, dataParaApi, mascaraDeData } from '../../../utils/validacoes';

const SELO = 56;

export default function PerfilIncompletoScreen() {
    const { authUser, updateMe } = useAuth();
    const navigation = usePrivateStackNavigation();
    const route = usePrivateStackRoute<'PerfilIncompleto'>();
    const nextScreen = route.params?.next ?? 'CriarReserva';

    const existingCompany = authUser?.company;
    const existingJobTitle = authUser?.jobTitle;
    const existingPhone = authUser?.phone;
    const existingBirthDate = authUser?.birthDate;

    const needsCompany = !existingCompany;
    const needsJobTitle = !existingJobTitle;
    const needsPhone = !existingPhone;
    // Contas antigas podem ter ficado sem data de nascimento, que é obrigatória.
    const needsBirthDate = !existingBirthDate;

    const [company, setCompany] = useState(existingCompany ?? '');
    const [jobTitle, setJobTitle] = useState(existingJobTitle ?? '');
    const [phone, setPhone] = useState(existingPhone ?? '');
    const [birthDate, setBirthDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canProceed =
        (!needsCompany || company.trim().length > 0) &&
        (!needsJobTitle || jobTitle.trim().length > 0) &&
        (!needsPhone || phone.trim().length > 0) &&
        (!needsBirthDate || dataDeNascimentoValida(birthDate));

    async function handleProceed() {
        if (!canProceed) return;
        setError(null);
        setLoading(true);
        try {
            await updateMe({
                name: authUser?.name ?? '',
                email: authUser?.email ?? '',
                birthDate: needsBirthDate ? dataParaApi(birthDate) : String(existingBirthDate),
                company: company.trim(),
                jobTitle: jobTitle.trim(),
                phone: phone.trim(),
            });
            navigation.replace(nextScreen);
        } catch (e: any) {
            setError(e?.message ?? 'Erro ao salvar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    function handleCancel() {
        navigation.goBack();
    }

    return (
        <ScrollComTeclado style={estilos.tela} contentContainerStyle={estilos.conteudo}>
            <View style={estilos.cabecalho}>
                <View style={estilos.selo}>
                    <Icone nome="perfil" cor={cores.azul} tamanho={28} />
                </View>
                <Texto variante="titulo" accessibilityRole="header">Só mais um passo!</Texto>
                <Texto variante="corpo" cor={cores.textoSecundario}>
                    {nextScreen === 'CriarImpressao'
                        ? 'Preencha seus dados profissionais para podermos prosseguir com o seu pedido de impressão.'
                        : 'Preencha seus dados profissionais para podermos prosseguir com a sua reserva.'}
                </Texto>
            </View>

            <View style={estilos.campos}>
                {needsCompany && (
                    <Campo
                        rotulo="Empresa/Instituição"
                        icone="empresa"
                        value={company}
                        onChangeText={setCompany}
                        placeholder="Nome da empresa ou instituição"
                    />
                )}
                {needsJobTitle && (
                    <Campo
                        rotulo="Cargo"
                        icone="perfil"
                        value={jobTitle}
                        onChangeText={setJobTitle}
                        placeholder="Seu cargo ou função"
                    />
                )}
                {needsPhone && (
                    <Campo
                        rotulo="Telefone"
                        icone="telefone"
                        value={phone}
                        onChangeText={(v) => {
                            const digits = v.replace(/\D/g, '').slice(0, 11);
                            let masked = digits;
                            if (digits.length > 2) masked = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
                            if (digits.length > 7) masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
                            setPhone(masked);
                        }}
                        keyboardType="phone-pad"
                        placeholder="Seu telefone"
                    />
                )}
                {needsBirthDate && (
                    <Campo
                        rotulo="Data de nascimento"
                        icone="calendario"
                        value={birthDate}
                        onChangeText={(texto) => setBirthDate(mascaraDeData(texto))}
                        keyboardType="numeric"
                        placeholder="DD/MM/AAAA"
                        erro={birthDate.length === 10 && !dataDeNascimentoValida(birthDate) ? MENSAGENS.dataDeNascimento : undefined}
                    />
                )}
                {error ? <Aviso tom="erro">{error}</Aviso> : null}
            </View>

            <View style={estilos.acoes}>
                <Botao
                    titulo="Prosseguir"
                    tamanho="alto"
                    onPress={handleProceed}
                    desabilitado={!canProceed}
                    carregando={loading}
                />
                <Botao titulo="Cancelar" variante="contorno" onPress={handleCancel} />
            </View>
        </ScrollComTeclado>
    );
}

const estilos = StyleSheet.create({
    tela: { flex: 1, backgroundColor: cores.chao },
    conteudo: {
        flexGrow: 1,
        gap: espaco.xxl,
        paddingHorizontal: espaco.l,
        paddingTop: espaco.xxl,
        paddingBottom: espaco.l,
    },
    cabecalho: { gap: espaco.s },
    selo: {
        width: SELO,
        height: SELO,
        borderRadius: raio.bilhete,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: espaco.s,
        backgroundColor: cores.azulSuave,
    },
    campos: { gap: espaco.l },
    // Com pouco conteúdo, os botões descem até o pé da tela.
    acoes: { marginTop: 'auto', gap: espaco.m },
});
