import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useORPC } from '../locomotiva-api/context';
import { ORPCOutputs } from '../locomotiva-api/types';
import { Aviso, cores, espaco } from '../ui';
import { CartaoDaSala } from './reservas/CartaoDaSala';

type RoomFromList = ORPCOutputs["booking"]["listRooms"][0]

interface RoomSelectorProps {
    selectedRoom: RoomFromList | null;
    setSelectedRoom: (room: RoomFromList) => void;
}

/** Salas ativas, uma embaixo da outra, como cartões com foto. Tocar no cartão escolhe a sala. */
export default function RoomSelector({ selectedRoom, setSelectedRoom }: RoomSelectorProps) {
    const orpc = useORPC();
    const { data: rooms, isLoading } = useQuery(orpc.booking.listRooms.queryOptions({ input: {} }));

    const availableRooms = useMemo(
        () => rooms?.filter(r => r.enabled) || [],
        [rooms]
    );

    if (isLoading) {
        return <ActivityIndicator style={estilos.carregando} color={cores.azul} accessibilityLabel="Carregando as salas" />;
    }

    if (availableRooms.length === 0) {
        return <Aviso>Nenhuma sala disponível no momento.</Aviso>;
    }

    return (
        <View style={estilos.lista} accessibilityRole="radiogroup" accessibilityLabel="Salas">
            {availableRooms.map((sala) => (
                <CartaoDaSala
                    key={sala.id}
                    nome={sala.name}
                    capacidade={sala.capacity}
                    descricao={sala.description}
                    photoUrl={sala.photoUrl}
                    escolhida={selectedRoom?.id === sala.id}
                    aoEscolher={() => setSelectedRoom(sala)}
                />
            ))}
        </View>
    );
}

const estilos = StyleSheet.create({
    carregando: { marginTop: espaco.xxl },
    lista: { gap: espaco.m },
});
