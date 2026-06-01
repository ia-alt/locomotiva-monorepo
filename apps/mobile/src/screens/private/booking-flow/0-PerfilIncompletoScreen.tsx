import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/auth-context';
import { usePrivateStackNavigation } from '../../../navigation/PrivateNavigator';

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
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconWrapper}>
                    <Feather name="user-x" size={40} color="#1E88E5" />
                </View>

                <Text style={styles.title}>Só mais um passo!</Text>
                <Text style={styles.subtitle}>
                    Preencha seus dados profissionais para podermos prosseguir com a sua reserva.
                </Text>

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
                                outlineStyle={styles.inputOutline}
                                right={<TextInput.Icon icon="office-building-outline" color="#9CA3AF" />}
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
                                outlineStyle={styles.inputOutline}
                                right={<TextInput.Icon icon="briefcase-outline" color="#9CA3AF" />}
                            />
                        </View>
                    )}
                    {needsPhone && (
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Telefone</Text>
                            <TextInput
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                mode="outlined"
                                placeholder="Seu telefone"
                                style={styles.input}
                                outlineStyle={styles.inputOutline}
                                right={<TextInput.Icon icon="phone-outline" color="#9CA3AF" />}
                            />
                        </View>
                    )}
                    {error && (
                        <Text style={styles.errorText}>{error}</Text>
                    )}
                </View>
            </View>

            <View style={styles.footer}>
                <Button
                    mode="contained"
                    onPress={handleProceed}
                    disabled={!canProceed || loading}
                    loading={loading}
                    style={styles.proceedButton}
                    contentStyle={styles.proceedButtonContent}
                    labelStyle={styles.proceedButtonLabel}
                >
                    Prosseguir
                </Button>

                <TouchableOpacity onPress={handleCancel} activeOpacity={0.7} style={styles.cancelWrapper}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 24,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 24,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 8,
        marginBottom: 32,
    },
    iconWrapper: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    fields: {
        width: '100%',
        gap: 16,
    },
    fieldGroup: {
        gap: 6,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    input: {
        backgroundColor: '#F9FAFB',
    },
    inputOutline: {
        borderRadius: 8,
        borderColor: '#E5E7EB',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
    },
    footer: {
        gap: 16,
        marginBottom: 8,
    },
    proceedButton: {
        borderRadius: 12,
        backgroundColor: '#1E88E5',
    },
    proceedButtonContent: {
        paddingVertical: 8,
    },
    proceedButtonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelWrapper: {
        alignItems: 'center',
        paddingVertical: 4,
    },
    cancelText: {
        fontSize: 16,
        color: '#6B7280',
        textDecorationLine: 'underline',
    },
});
