import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useAuth } from '../../contexts/auth-context';
import { usePrivateStackNavigation } from '../../navigation/PrivateNavigator';

// Converte YYYY-MM-DD (API) → DD/MM/AAAA (exibição)
function toDisplayDate(value: string | Date | undefined): string {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const [yyyy, mm, dd] = d.toISOString().split('T')[0].split('-');
    return `${dd}/${mm}/${yyyy}`;
}

// Converte DD/MM/AAAA → YYYY-MM-DD (API)
function toApiDate(value: string): string {
    const [dd, mm, yyyy] = value.split('/');
    return `${yyyy}-${mm}-${dd}`;
}

function isValidDisplayDate(value: string): boolean {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;
    const [dd, mm, yyyy] = value.split('/').map(Number);
    const d = new Date(yyyy, mm - 1, dd);
    return d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd;
}

// Aplica máscara automática enquanto o usuário digita
function applyDateMask(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

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
    const [birthDate, setBirthDate] = useState(toDisplayDate(authUser?.birthDate));
    const [email, setEmail] = useState(authUser?.email ?? '');
    const [phone, setPhone] = useState(applyPhoneMask(authUser?.phone ?? ''));
    const [company, setCompany] = useState(authUser?.company ?? '');
    const [jobTitle, setJobTitle] = useState(authUser?.jobTitle ?? '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const nameError = name.trim().length === 0 ? 'Nome é obrigatório' : null;
    const emailError = !email.includes('@') ? 'E-mail inválido' : null;
    const birthDateError = birthDate && !isValidDisplayDate(birthDate) ? 'Data inválida' : null;
    const phoneError = phone.replace(/\D/g, '').length < 10 ? 'Telefone é obrigatório' : null;

    const canSubmit = !nameError && !emailError && !birthDateError && !phoneError && !loading;

    async function handleSave() {
        if (!canSubmit) return;
        setError(null);
        setLoading(true);
        try {
            await updateMe({
                name: name.trim(),
                email,
                birthDate: toApiDate(birthDate),
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
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text variant="titleMedium" style={styles.sectionTitle}>
                Dados pessoais
            </Text>

            <TextInput
                label="Nome completo"
                value={name}
                onChangeText={setName}
                mode="outlined"
                error={!!nameError}
                style={styles.input}
            />
            {nameError && <HelperText type="error">{nameError}</HelperText>}

            <TextInput
                label="Data de nascimento"
                value={birthDate}
                onChangeText={(v) => setBirthDate(applyDateMask(v))}
                mode="outlined"
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                error={!!birthDateError}
                style={styles.input}
            />
            {birthDateError && <HelperText type="error">{birthDateError}</HelperText>}

            <TextInput
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!emailError}
                style={styles.input}
            />
            {emailError && <HelperText type="error">{emailError}</HelperText>}

            <TextInput
                label="Telefone"
                value={phone}
                onChangeText={(v) => setPhone(applyPhoneMask(v))}
                mode="outlined"
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                maxLength={15}
                error={!!phoneError}
                style={styles.input}
            />
            {phoneError && <HelperText type="error">{phoneError}</HelperText>}

            <TextInput
                label="Empresa/Instituição (opcional)"
                value={company}
                onChangeText={setCompany}
                mode="outlined"
                style={styles.input}
            />

            <TextInput
                label="Cargo (opcional)"
                value={jobTitle}
                onChangeText={setJobTitle}
                mode="outlined"
                style={styles.input}
            />

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
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button
                    mode="contained"
                    onPress={handleSave}
                    loading={loading}
                    disabled={!canSubmit}
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
