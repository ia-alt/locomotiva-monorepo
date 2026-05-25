import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { BookingsProvider, useBookings } from '../../contexts/ReservasContext';
import BookingCard from '../../components/BookingCard';
import { usePrivateStackNavigation } from '../../navigation/PrivateNavigator';
import { useAuth } from '../../contexts/auth-context';

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
                <ActivityIndicator size="small" color="#3B82F6" />
            </View>
        );
    };

    if (isLoading && !isRefetching && bookings.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.title}>Minhas Reservas</Text>
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
                        <Text style={styles.emptyText}>Você ainda não possui reservas.</Text>
                    </View>
                }
            />

            <FAB
                icon="plus"
                color="#FFFFFF"
                style={styles.fab}
                onPress={() => {
                    const profileComplete = !!(authUser as any)?.company && !!(authUser as any)?.jobTitle;
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
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,
        backgroundColor: '#F9FAFB',
    },
    title: {
        fontWeight: 'bold',
        color: '#111827',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100, // Make room for FAB
    },
    loadingFooter: {
        paddingVertical: 20,
        alignItems: 'center',
        height: 60,
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#1E88E5',
    },
});
