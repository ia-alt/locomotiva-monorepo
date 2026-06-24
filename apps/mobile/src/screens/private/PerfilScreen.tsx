import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Avatar, List } from 'react-native-paper';
import { useAuth } from '../../contexts/auth-context';
import { usePrivateStackNavigation } from '../../navigation/PrivateNavigator';
import { version } from '../../../package.json';
import { PrimaryButton } from '../../design/components';
import { colors, spacing, radius, typography } from '../../design/tokens';

function getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('');
}

function formatCpf(cpf: string | undefined): string {
    if (!cpf) return '-';
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return cpf;
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatDate(date: string | Date | undefined): string {
    if (!date) return '-';
    if (typeof date === 'string') {
        const [year, month, day] = date.split('T')[0].split('-').map(Number);
        if (!year || !month || !day) return '-';
        return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-BR');
}

export default function PerfilScreen() {
    const { authUser, logout } = useAuth();
    const navigation = usePrivateStackNavigation();

    const infoItems = [
        { icon: 'card-account-details-outline', title: 'CPF', value: formatCpf(authUser?.cpf) },
        { icon: 'calendar-outline', title: 'Data de nascimento', value: formatDate(authUser?.birthDate) },
        { icon: 'email-outline', title: 'E-mail', value: authUser?.email ?? '-' },
        { icon: 'phone-outline', title: 'Telefone', value: (authUser as any)?.phone ?? 'Não informado' },
        ...((authUser as any)?.company ? [{ icon: 'domain', title: 'Empresa/Instituição', value: (authUser as any).company }] : []),
        ...((authUser as any)?.jobTitle ? [{ icon: 'briefcase-outline', title: 'Cargo', value: (authUser as any).jobTitle }] : []),
    ];

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
            {/* Cabeçalho do perfil */}
            <View style={styles.avatarSection}>
                <Avatar.Text
                    size={88}
                    label={getInitials(authUser?.name)}
                    style={styles.avatar}
                    labelStyle={styles.avatarLabel}
                />
                <Text style={styles.name}>{authUser?.name ?? 'Usuário'}</Text>
                <Text style={styles.email}>{authUser?.email ?? ''}</Text>
            </View>

            {/* Informações em card */}
            <Text style={styles.sectionTitle}>Informações</Text>
            <View style={styles.card}>
                {infoItems.map((item, index) => (
                    <List.Item
                        key={item.title}
                        title={item.value}
                        description={item.title}
                        titleStyle={styles.itemValue}
                        descriptionStyle={styles.itemLabel}
                        left={(props) => <List.Icon {...props} icon={item.icon} color={colors.brand.blue} />}
                        style={[styles.listItem, index < infoItems.length - 1 && styles.listItemBordered]}
                    />
                ))}
            </View>

            {/* Ações */}
            <View style={styles.actionsSection}>
                <PrimaryButton onPress={() => navigation.navigate('EditarPerfil')} icon="pencil-outline">
                    Editar perfil
                </PrimaryButton>
                <Button
                    mode="outlined"
                    icon="lock-outline"
                    onPress={() => navigation.navigate('AlterarSenha')}
                    style={styles.outlineButton}
                    textColor={colors.brand.navy}
                    labelStyle={styles.outlineLabel}
                >
                    Alterar senha
                </Button>
                <Button
                    mode="outlined"
                    icon="logout"
                    onPress={() => logout()}
                    style={styles.logoutButton}
                    textColor={colors.feedback.error}
                    labelStyle={styles.outlineLabel}
                >
                    Sair da conta
                </Button>
            </View>

            <Text style={styles.versionText}>v{version}</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.surface.background,
    },
    container: {
        padding: spacing.lg,
        flexGrow: 1,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
        gap: spacing.xs,
    },
    avatar: {
        backgroundColor: colors.brand.navy,
        marginBottom: spacing.xs,
    },
    avatarLabel: {
        fontFamily: typography.family,
        fontWeight: typography.weight.bold,
    },
    name: {
        fontFamily: typography.family,
        fontWeight: typography.weight.bold,
        fontSize: typography.size.xl,
        color: colors.text.primary,
    },
    email: {
        fontFamily: typography.family,
        color: colors.text.secondary,
        fontSize: typography.size.base,
    },
    sectionTitle: {
        fontFamily: typography.family,
        fontWeight: typography.weight.bold,
        color: colors.brand.navy,
        fontSize: typography.size.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginTop: spacing.base,
        marginBottom: spacing.md,
    },
    card: {
        backgroundColor: colors.surface.card,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        overflow: 'hidden',
    },
    listItem: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
    },
    listItemBordered: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border.subtle,
    },
    itemValue: {
        fontFamily: typography.family,
        fontWeight: typography.weight.semibold,
        color: colors.text.primary,
        fontSize: typography.size.md,
    },
    itemLabel: {
        fontFamily: typography.family,
        color: colors.text.muted,
        fontSize: typography.size.sm,
    },
    actionsSection: {
        paddingTop: spacing.xl,
        gap: spacing.md,
    },
    outlineButton: {
        width: '100%',
        borderRadius: radius.md,
        borderColor: colors.border.strong,
    },
    logoutButton: {
        width: '100%',
        borderRadius: radius.md,
        borderColor: colors.feedback.error,
    },
    outlineLabel: {
        fontFamily: typography.family,
        fontSize: typography.size.base,
        fontWeight: typography.weight.semibold,
        paddingVertical: spacing.xs,
    },
    versionText: {
        fontFamily: typography.family,
        textAlign: 'center',
        fontSize: typography.size.xs,
        color: colors.text.muted,
        marginTop: spacing.lg,
        paddingBottom: spacing.sm,
    },
});
