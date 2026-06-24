import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BookingsProvider, useBookings } from '../../contexts/ReservasContext';
import BookingCard from '../../components/BookingCard';
import { usePrivateStackNavigation } from '../../navigation/PrivateNavigator';
import { useAuth } from '../../contexts/auth-context';
import { colors, spacing, radius, typography } from '../../design/tokens';

function ReservasList() {
    const navigation = usePrivateStackNavigation();
    const { authUser } = useAuth();
    const {
        bookings,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
        isRefetching
    } = useBookings();

    const renderItem = (item: typeof bookings[0]) => (
        <BookingCard
            booking={item}
            onPressDetails={() => {
                navigation.navigate('DetalhesMinhaReserva', { bookingId: item.id });
            }}
        />
    );

    const renderFooter = () => {
        if (!isFetchingNextPage) return <View style={{ height: 60 }} />;
        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={colors.brand.navy} />
            </View>
        );
    };

    if (isLoading && !isRefetching && bookings.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.brand.navy} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Minhas Reservas</Text>
                <Text style={styles.subtitle}>Acompanhe e gerencie seus agendamentos.</Text>
            </View>

            <FlatList
                data={bookings}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => renderItem(item)}
                contentContainerStyle={styles.listContent}
                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                        fetchNextPage();
                    }
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                refreshControl={
                    <RefreshControl refreshing={isRefetching && !isLoading} onRefresh={refetch} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIcon}>
                            <MaterialCommunityIcons name="calendar-blank-outline" size={36} color={colors.brand.blue} />
                        </View>
                        <Text style={styles.emptyTitle}>Nenhuma reserva ainda</Text>
                        <Text style={styles.emptyText}>
                            Toque em “Nova Reserva” para agendar seu primeiro espaço.
                        </Text>
                    </View>
                }
            />

            <FAB
                icon="plus"
                color="#FFFFFF"
                style={styles.fab}
                onPress={() => {
                    const profileComplete = !!(authUser as any)?.company && !!(authUser as any)?.jobTitle && !!(authUser as any)?.phone;
                    navigation.navigate(profileComplete ? 'CriarReserva' : 'PerfilIncompleto');
                }}
                label='Nova Reserva'
            />
        </View>
    );
}

export default function ReservasScreen() {
    return (
        <BookingsProvider>
            <ReservasList />
        </BookingsProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface.background,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.base,
        backgroundColor: colors.surface.background,
    },
    title: {
        fontFamily: typography.family,
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
        fontSize: typography.size.xxl,
    },
    subtitle: {
        fontFamily: typography.family,
        color: colors.text.secondary,
        fontSize: typography.size.base,
        marginTop: spacing.xs,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surface.background,
    },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: 100, // espaço para o FAB
    },
    loadingFooter: {
        paddingVertical: spacing.lg,
        alignItems: 'center',
        height: 60,
    },
    emptyContainer: {
        paddingVertical: spacing.xxl,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
    },
    emptyIcon: {
        width: 72,
        height: 72,
        borderRadius: radius.full,
        backgroundColor: colors.brand.light,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.base,
    },
    emptyTitle: {
        fontFamily: typography.family,
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
        fontSize: typography.size.lg,
        marginBottom: spacing.xs,
    },
    emptyText: {
        fontFamily: typography.family,
        fontSize: typography.size.base,
        color: colors.text.muted,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        margin: spacing.base,
        right: 0,
        bottom: 0,
        backgroundColor: colors.brand.navy,
        borderRadius: radius.lg,
    },
});
