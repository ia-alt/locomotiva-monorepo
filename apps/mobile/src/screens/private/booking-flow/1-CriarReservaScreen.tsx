import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { usePrivateStackNavigation } from '../../../navigation/PrivateNavigator';
import RoomSelector from '../../../components/RoomSelector';
import { HorarioFuncionamentoCard } from '../../../components/HorarioFuncionamentoCard';
import { EtapaDaReserva } from '../../../components/reservas/EtapaDaReserva';
import { ORPCOutputs } from '../../../locomotiva-api/types';
import { Botao, Texto, cores, espaco } from '../../../ui';

type RoomFromList = ORPCOutputs["booking"]["listRooms"][0]

export default function CriarReservaScreen() {
    const navigation = usePrivateStackNavigation();

    const [selectedRoom, setSelectedRoom] = useState<RoomFromList | null>(null)

    return (
        <EtapaDaReserva
            etapa={0}
            acao={
                <Botao
                    titulo="Avançar"
                icone="seguir"
                iconeNoFim
                    tamanho="alto"
                    desabilitado={!selectedRoom}
                    onPress={() => {
                        if (selectedRoom) {
                            navigation.navigate('DisponibilidadeReserva', { room: selectedRoom });
                        }
                    }}
                />
            }
        >
            <View style={estilos.introducao}>
                <Texto variante="explicacao" cor={cores.textoSecundario}>
                    Selecione a sala desejada para a reserva. Cada cartão mostra o que a sala oferece.
                </Texto>
                <HorarioFuncionamentoCard />
            </View>

            <RoomSelector
                selectedRoom={selectedRoom}
                setSelectedRoom={setSelectedRoom}
            />
        </EtapaDaReserva>
    );
}

const estilos = StyleSheet.create({
    introducao: { gap: espaco.l },
});
