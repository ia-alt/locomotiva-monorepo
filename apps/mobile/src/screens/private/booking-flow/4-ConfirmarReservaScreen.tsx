import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { usePrivateStackNavigation, usePrivateStackRoute } from '../../../navigation/PrivateNavigator';
import { useMutation } from '@tanstack/react-query';
import { useORPC } from '../../../locomotiva-api/context';
import { onlyDateStrToLongBrDate, onlyTimeObjToTimeStr } from '../../../utils/datetime-formaters';
import { EtapaDaReserva } from '../../../components/reservas/EtapaDaReserva';
import { PreviaDoBilhete } from '../../../components/reservas/PreviaDoBilhete';
import { Aviso, Botao, Cartao, LinhaDeInformacao, Texto, cores, espaco } from '../../../ui';


export default function ConfirmarReservaScreen() {
    const navigation = usePrivateStackNavigation();
    const route = usePrivateStackRoute<"ConfirmarReserva">();
    const orpc = useORPC();

    const {
        room,
        day,
        startTime,
        endTime,
        title,
        description,
        numberOfPeople,
    } = route.params;

    const { mutateAsync: requestBooking } = useMutation(orpc.booking.requestBooking.mutationOptions());

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFinalConfirm = async () => {
        setIsSubmitting(true);
        try {
            console.log("Saving reservation", {
                room,
                day,
                startTime,
                endTime,
                title,
                description
            });

            await requestBooking({
                roomId: room.id,
                day,
                timeInterval: {
                    start: startTime,
                    end: endTime,
                },
                title,
                description,
                numberOfPeople,
            });

            navigation.navigate('ReservaSucesso');

        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <EtapaDaReserva
            etapa={3}
            acao={
                <Botao
                    titulo="Confirmar reserva"
                    icone="check"
                    tamanho="alto"
                    carregando={isSubmitting}
                    onPress={handleFinalConfirm}
                />
            }
        >
            <Texto variante="explicacao" cor={cores.textoSecundario}>
                Revise os dados abaixo. Se tudo estiver correto, confirme para finalizar sua reserva.
            </Texto>

            <PreviaDoBilhete
                titulo={title}
                sala={room.name}
                dia={day}
                inicio={startTime}
                fim={endTime}
                pessoas={numberOfPeople}
            />

            <Aviso>Depois de confirmar, a reserva fica aguardando a aprovação da nossa equipe.</Aviso>

            <Cartao titulo="Detalhes da reserva">
                <View style={estilos.atividade}>
                    <Texto variante="destaque">{title}</Texto>
                    <Texto variante="corpo" cor={cores.textoSecundario}>{description}</Texto>
                </View>
                <LinhaDeInformacao
                    icone="pessoas"
                    rotulo="Pessoas"
                    valor={`${numberOfPeople} ${numberOfPeople === 1 ? 'pessoa' : 'pessoas'}`}
                />
                <LinhaDeInformacao icone="calendario" rotulo="Data" valor={onlyDateStrToLongBrDate(day)} />
                <LinhaDeInformacao
                    icone="relogio"
                    rotulo="Horário"
                    valor={`${onlyTimeObjToTimeStr(startTime)} às ${onlyTimeObjToTimeStr(endTime)}`}
                />
                <LinhaDeInformacao
                    icone="local"
                    rotulo="Sala"
                    valor={
                        <View>
                            <Texto variante="destaqueMedio">{room.name}</Texto>
                            <Texto variante="apoio" cor={cores.textoSecundario}>Capacidade: {room.capacity} pessoas</Texto>
                        </View>
                    }
                />
            </Cartao>
        </EtapaDaReserva>
    );
}

const estilos = StyleSheet.create({
    atividade: { gap: espaco.xs },
});
