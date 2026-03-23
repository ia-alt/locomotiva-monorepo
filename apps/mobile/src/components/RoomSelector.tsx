import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Modal, FlatList, ActivityIndicator } from 'react-native';
import { Text, Surface, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useORPC } from '../locomotiva-api/context';
import { useQuery } from '@tanstack/react-query';

interface RoomSelectorProps {
    selectedRoomId: string | null;
    setSelectedRoomId: (id: string) => void;
}

export default function RoomSelector({ selectedRoomId, setSelectedRoomId }: RoomSelectorProps) {
    const orpc = useORPC();
    const { data: rooms, isLoading } = useQuery(orpc.booking.listRooms.queryOptions({ input: {} }));

    const [modalVisible, setModalVisible] = useState(false);

    const selectedRoom = rooms?.find(r => r.id === selectedRoomId);

    // Filter to only show enabled rooms in the selector, although API should ideally only return available
    const availableRooms = rooms?.filter(r => r.enabled) || [];

    return (
        <View style={styles.container}>
            <Text variant="titleMedium" style={styles.label}>Selecionar Sala</Text>

            <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.7} disabled={isLoading}>
                <Surface style={styles.selectorCard} elevation={0}>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#4F46E5" />
                        </View>
                    ) : (
                        <>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=200&h=200' }}
                                style={styles.image}
                            />
                            <View style={styles.textContainer}>
                                <Text variant="titleMedium" style={styles.roomName}>
                                    {selectedRoom ? selectedRoom.name : 'Selecione uma sala...'}
                                </Text>
                                {selectedRoom && (
                                    <Text variant="bodyMedium" style={styles.roomCapacity}>
                                        Capacidade: {selectedRoom.capacity} pessoas
                                    </Text>
                                )}
                            </View>
                            <Ionicons name="chevron-down" size={24} color="#6B7280" />
                        </>
                    )}
                </Surface>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setModalVisible(false)} />
                    <Surface style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Salas Disponíveis</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <Divider />
                        {availableRooms.length === 0 ? (
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <Text>Nenhuma sala disponível no momento.</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={availableRooms}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => {
                                            setSelectedRoomId(item.id);
                                            setModalVisible(false);
                                        }}
                                    >
                                        <Image
                                            source={{ uri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=200&h=200' }}
                                            style={styles.modalItemImage}
                                        />
                                        <View style={styles.modalItemText}>
                                            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.name}</Text>
                                            <Text variant="bodyMedium" style={{ color: '#6B7280' }}>Capacidade: {item.capacity} pessoas</Text>
                                        </View>
                                        {selectedRoomId === item.id && (
                                            <Ionicons name="checkmark-circle" size={24} color="#0D9488" />
                                        )}
                                    </TouchableOpacity>
                                )}
                                ItemSeparatorComponent={() => <Divider />}
                                contentContainerStyle={{ paddingBottom: 20 }}
                            />
                        )}
                    </Surface>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        color: '#374151',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    selectorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
    },
    image: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#F3F4F6',
    },
    textContainer: {
        flex: 1,
    },
    roomName: {
        fontWeight: 'bold',
        color: '#1F2937',
    },
    roomCapacity: {
        color: '#6B7280',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    modalItemImage: {
        width: 40,
        height: 40,
        borderRadius: 8,
        marginRight: 12,
    },
    modalItemText: {
        flex: 1,
    }
});
