import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text, TextInput } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/auth-context';
import { usePrivateStackNavigation } from '../../../navigation/PrivateNavigator';
import { PrimaryButton } from '../../../design/components';
import { colors, spacing, radius, typography } from '../../../design/tokens';

export default function PerfilIncompletoScreen() {
    const { authUser, updateMe } = useAuth();
    const navigation = usePrivateStackNavigation();

    const existingCompany = authUser?.company;
    const existingJobTitle = authUser?.jobTitle;
    const existingPhone = authUser?.phone;

    const needsCompany = !existingCompany;
    const needsJobTitle = !existingJobTitle;
    const needsPhone = !existingPhone;

    const [company, setCompany] = useState(existingCompany ?? '');
    const [jobTitle, setJobTitle] = useState(existingJobTitle ?? '');
    const [phone, setPhone] = useState(existingPhone ?? '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canProceed =
        (!needsCompany || company.trim().length > 0) &&
        (!needsJobTitle || jobTitle.trim().length > 0) &&
        (!needsPhone || phone.trim().length > 0);

    async function handleProceed() {
        if (!canProceed) return;
        setError(null);
        setLoading(true);
        try {
            await updateMe({
                name: authUser?.name ?? '',
                email: authUser?.email ?? '',
                birthDate: (authUser as any)?.birthDate ?? '',
                company: company.trim(),
                jobTitle: jobTitle.trim(),
                phone: phone.trim(),
            });
            navigation.replace('CriarReserva');
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
        <KeyboardAwareScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            extraScrollHeight={20}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.content}>
                <View style={styles.iconWrapper}>
                    <Feather name="user-check" size={36} color={colors.brand.blue} />
                </View>

                <Text style={styles.title}>Só mais um passo!</Text>
                <Text style={styles.subtitle}>
                    Preencha seus dados profissionais para podermos prosseguir com a sua reserva.
                </Text>

                <View style={styles.card}>
                    <View style={styles.fields}>
                        {needsCompany && (
                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Empresa/Instituição</Text>
                                <TextInput
                                    value={company}
                                    onChangeText={setCompany}
                                    mode="outlined"
                                    placeholder="Nome da empresa ou instituição"
                                    style={styles.input}
                                    outlineColor={colors.border.subtle}
                                    activeOutlineColor={colors.brand.blue}
                                    textColor={colors.text.primary}
                                    placeholderTextColor={colors.text.muted}
                                    outlineStyle={styles.inputOutline}
                                    right={<TextInput.Icon icon="office-building-outline" color={colors.text.muted} />}
                                />
                            </View>
                        )}
                        {needsJobTitle && (
                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Cargo</Text>
                                <TextInput
                                    value={jobTitle}
                                    onChangeText={setJobTitle}
                                    mode="outlined"
                                    placeholder="Seu cargo ou função"
                                    style={styles.input}
                                    outlineColor={colors.border.subtle}
                                    activeOutlineColor={colors.brand.blue}
                                    textColor={colors.text.primary}
                                    placeholderTextColor={colors.text.muted}
                                    outlineStyle={styles.inputOutline}
                                    right={<TextInput.Icon icon="briefcase-outline" color={colors.text.muted} />}
                                />
                            </View>
                        )}
                        {needsPhone && (
                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Telefone</Text>
                                <TextInput
                                    value={phone}
                                    onChangeText={(v) => {
                                    const digits = v.replace(/\D/g, '').slice(0, 11);
                                    let masked = digits;
                                    if (digits.length > 2) masked = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
                                    if (digits.length > 7) masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
                                    setPhone(masked);
                                }}
                                    keyboardType="phone-pad"
                                    mode="outlined"
                                    placeholder="Seu telefone"
                                    style={styles.input}
                                    outlineColor={colors.border.subtle}
                                    activeOutlineColor={colors.brand.blue}
                                    textColor={colors.text.primary}
                                    placeholderTextColor={colors.text.muted}
                                    outlineStyle={styles.inputOutline}
                                    right={<TextInput.Icon icon="phone-outline" color={colors.text.muted} />}
                                />
                            </View>
                        )}
                        {error && (
                            <Text style={styles.errorText}>{error}</Text>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <PrimaryButton
                    onPress={handleProceed}
                    disabled={!canProceed || loading}
                    loading={loading}
                    icon="arrow-right"
                >
                    Completar perfil
                </PrimaryButton>

                <TouchableOpacity onPress={handleCancel} activeOpacity={0.7} style={styles.cancelWrapper}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: colors.surface.background,
    },
    container: {
        flexGrow: 1,
        padding: spacing.lg,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontFamily: typography.family,
        fontSize: typography.size.xxl,
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: typography.family,
        fontSize: typography.size.md,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: spacing.sm,
        marginBottom: spacing.xl,
    },
    iconWrapper: {
        width: 88,
        height: 88,
        borderRadius: radius.full,
        backgroundColor: colors.brand.light,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    card: {
        width: '100%',
        backgroundColor: colors.surface.card,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        padding: spacing.lg,
    },
    fields: {
        width: '100%',
        gap: spacing.base,
    },
    fieldGroup: {
        gap: spacing.sm,
    },
    fieldLabel: {
        fontFamily: typography.family,
        fontSize: typography.size.base,
        fontWeight: typography.weight.semibold,
        color: colors.text.primary,
    },
    input: {
        backgroundColor: colors.surface.card,
        fontSize: typography.size.md,
    },
    inputOutline: {
        borderRadius: radius.md,
    },
    errorText: {
        fontFamily: typography.family,
        color: colors.feedback.error,
        fontSize: typography.size.base,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    footer: {
        gap: spacing.base,
        marginTop: spacing.xl,
        marginBottom: spacing.sm,
    },
    cancelWrapper: {
        alignItems: 'center',
        paddingVertical: spacing.xs,
    },
    cancelText: {
        fontFamily: typography.family,
        fontSize: typography.size.md,
        color: colors.text.secondary,
        fontWeight: typography.weight.semibold,
    },
});
