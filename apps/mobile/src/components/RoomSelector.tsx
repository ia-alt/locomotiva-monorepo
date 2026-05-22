import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Modal, FlatList, ActivityIndicator, StatusBar, Dimensions, useWindowDimensions } from 'react-native';
import { Text, Surface, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useORPC } from '../locomotiva-api/context';
import { useQuery } from '@tanstack/react-query';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RoomSelectorProps {
    selectedRoomId: string | null;
    setSelectedRoomId: (id: string, capacity: number) => void;
}

const MAX_WIDTH = 800;

export default function RoomSelector({ selectedRoomId, setSelectedRoomId }: RoomSelectorProps) {
    const orpc = useORPC();
    const { data: rooms, isLoading } = useQuery(orpc.booking.listRooms.queryOptions({ input: {} }));
    const { width } = useWindowDimensions();
    const modalWidth = Math.min(width, MAX_WIDTH);

    const [modalVisible, setModalVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const selectedRoom = rooms?.find(r => r.id === selectedRoomId);

    const availableRooms = rooms?.filter(r => r.enabled) || [];

    const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=200&h=200';
    const getRoomImage = (room: typeof selectedRoom) => room?.photoUrl || FALLBACK_IMAGE;

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
                                source={{ uri: getRoomImage(selectedRoom) }}
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
                    <Surface style={[styles.modalContent, { width: modalWidth, alignSelf: 'center' }]}>
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
                                            setSelectedRoomId(item.id, item.capacity);
                                            setModalVisible(false);
                                        }}
                                    >
                                        <TouchableOpacity
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                setPreviewImage(getRoomImage(item));
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <View>
                                                <Image
                                                    source={{ uri: getRoomImage(item) }}
                                                    style={styles.modalItemImage}
                                                />
                                                <View style={styles.previewBadge}>
                                                    <Ionicons name="expand-outline" size={10} color="#fff" />
                                                </View>
                                            </View>
                                        </TouchableOpacity>
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

            {/* Modal visualização em tela cheia */}
            <Modal visible={!!previewImage} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setPreviewImage(null)}>
                <View style={styles.fullscreenOverlay}>
                    <StatusBar hidden />
                    <TouchableOpacity style={styles.fullscreenClose} onPress={() => setPreviewImage(null)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                        <Ionicons name="close-circle" size={36} color="#fff" />
                    </TouchableOpacity>
                    {previewImage && (
                        <Image
                            source={{ uri: previewImage }}
                            style={styles.fullscreenImage}
                            resizeMode="contain"
                        />
                    )}
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
    },
    previewBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: 4,
        padding: 2,
    },
    fullscreenOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenClose: {
        position: 'absolute',
        top: 48,
        right: 20,
        zIndex: 10,
    },
    fullscreenImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.75,
    },
});
