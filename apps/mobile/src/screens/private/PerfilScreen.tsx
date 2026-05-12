import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Avatar, Divider, List } from 'react-native-paper';
import { useAuth } from '../../contexts/auth-context';
import { usePrivateStackNavigation } from '../../navigation/PrivateNavigator';
import { version } from '../../../package.json';

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

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.avatarSection}>
                <Avatar.Text
                    size={80}
                    label={getInitials(authUser?.name)}
                    style={styles.avatar}
                />
                <Text variant="titleLarge" style={styles.name}>
                    {authUser?.name ?? 'Usuário'}
                </Text>
                <Text variant="bodyMedium" style={styles.email}>
                    {authUser?.email ?? ''}
                </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoSection}>
                <Text variant="labelLarge" style={styles.sectionTitle}>
                    Informações
                </Text>

                <List.Item
                    title="E-mail"
                    description={authUser?.email ?? '-'}
                    left={(props) => <List.Icon {...props} icon="email-outline" />}
                />
                <Divider />
                <List.Item
                    title="CPF"
                    description={formatCpf(authUser?.cpf)}
                    left={(props) => <List.Icon {...props} icon="card-account-details-outline" />}
                />
                <Divider />
                <List.Item
                    title="Data de nascimento"
                    description={formatDate(authUser?.birthDate)}
                    left={(props) => <List.Icon {...props} icon="calendar-outline" />}
                />
                {(authUser as any)?.company ? (
                    <>
                        <Divider />
                        <List.Item
                            title="Empresa/Instituição"
                            description={(authUser as any).company}
                            left={(props) => <List.Icon {...props} icon="domain" />}
                        />
                    </>
                ) : null}
                {(authUser as any)?.jobTitle ? (
                    <>
                        <Divider />
                        <List.Item
                            title="Cargo"
                            description={(authUser as any).jobTitle}
                            left={(props) => <List.Icon {...props} icon="briefcase-outline" />}
                        />
                    </>
                ) : null}
            </View>

            <Divider style={styles.divider} />

            <View style={styles.actionsSection}>
                <Button
                    mode="contained"
                    icon="pencil-outline"
                    onPress={() => navigation.navigate('EditarPerfil')}
                    style={styles.editButton}
                >
                    Editar perfil
                </Button>
                <Button
                    mode="outlined"
                    icon="lock-outline"
                    onPress={() => navigation.navigate('AlterarSenha')}
                    style={styles.changePasswordButton}
                >
                    Alterar senha
                </Button>
                <Button
                    mode="outlined"
                    icon="logout"
                    onPress={() => logout()}
                    style={styles.logoutButton}
                    textColor="#d32f2f"
                >
                    Sair da conta
                </Button>
            </View>

            <Text style={styles.versionText}>v{version}</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        flexGrow: 1,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 24,
        gap: 8,
    },
    avatar: {
        marginBottom: 4,
    },
    name: {
        fontWeight: '600',
    },
    email: {
        opacity: 0.6,
    },
    divider: {
        marginVertical: 8,
    },
    sectionTitle: {
        paddingHorizontal: 16,
        paddingBottom: 4,
        opacity: 0.5,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    infoSection: {
        gap: 0,
    },
    actionsSection: {
        paddingTop: 16,
        gap: 12,
    },
    editButton: {
        width: '100%',
    },
    changePasswordButton: {
        width: '100%',
    },
    logoutButton: {
        borderColor: '#d32f2f',
        width: '100%',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 24,
        paddingBottom: 8,
    },
});
