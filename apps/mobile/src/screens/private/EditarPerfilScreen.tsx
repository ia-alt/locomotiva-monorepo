import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useAuth } from '../../contexts/auth-context';
import { usePrivateStackNavigation } from '../../navigation/PrivateNavigator';
import { PrimaryButton } from '../../design/components';
import { colors, spacing, radius, typography } from '../../design/tokens';

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

function applyDateMask(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function applyPhoneMask(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
        return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    }
    return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');
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

    // Props comuns para todos os inputs — mesma cara do FormField das outras telas
    const inputProps = {
        mode: 'outlined' as const,
        outlineColor: colors.border.subtle,
        activeOutlineColor: colors.brand.blue,
        textColor: colors.text.primary,
        style: styles.input,
        outlineStyle: styles.inputOutline,
    };

    return (
        <KeyboardAwareScrollView
            style={styles.screen}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid
            extraScrollHeight={20}
        >
            <Text style={styles.sectionTitle}>Dados pessoais</Text>

            <View style={styles.card}>
                <TextInput label="Nome completo" value={name} onChangeText={setName} error={!!nameError} {...inputProps} />
                {nameError && <HelperText type="error">{nameError}</HelperText>}

                <TextInput
                    label="Data de nascimento"
                    value={birthDate}
                    onChangeText={(v) => setBirthDate(applyDateMask(v))}
                    placeholder="DD/MM/AAAA"
                    keyboardType="numeric"
                    error={!!birthDateError}
                    {...inputProps}
                />
                {birthDateError && <HelperText type="error">{birthDateError}</HelperText>}

                <TextInput
                    label="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={!!emailError}
                    {...inputProps}
                />
                {emailError && <HelperText type="error">{emailError}</HelperText>}

                <TextInput
                    label="Telefone"
                    value={phone}
                    onChangeText={(v) => setPhone(applyPhoneMask(v))}
                    placeholder="(00) 00000-0000"
                    keyboardType="phone-pad"
                    maxLength={15}
                    error={!!phoneError}
                    {...inputProps}
                />
                {phoneError && <HelperText type="error">{phoneError}</HelperText>}

                <TextInput label="Empresa/Instituição (opcional)" value={company} onChangeText={setCompany} {...inputProps} />
                <TextInput label="Cargo (opcional)" value={jobTitle} onChangeText={setJobTitle} {...inputProps} />
            </View>

            {error && <HelperText type="error" style={styles.globalError}>{error}</HelperText>}

            <View style={styles.actions}>
                <Button
                    mode="outlined"
                    onPress={() => navigation.goBack()}
                    style={styles.cancelButton}
                    labelStyle={styles.cancelLabel}
                    textColor={colors.text.secondary}
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <View style={styles.saveButton}>
                    <PrimaryButton onPress={handleSave} loading={loading} disabled={!canSubmit}>
                        Salvar
                    </PrimaryButton>
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.surface.background,
    },
    container: {
        padding: spacing.lg,
    },
    sectionTitle: {
        fontFamily: typography.family,
        fontWeight: typography.weight.bold,
        color: colors.brand.navy,
        fontSize: typography.size.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: spacing.md,
    },
    card: {
        backgroundColor: colors.surface.card,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        padding: spacing.base,
        gap: spacing.xs,
    },
    input: {
        backgroundColor: colors.surface.card,
        marginBottom: spacing.xs,
    },
    inputOutline: {
        borderRadius: radius.md,
    },
    globalError: {
        marginTop: spacing.sm,
        fontSize: typography.size.base,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginTop: spacing.lg,
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
