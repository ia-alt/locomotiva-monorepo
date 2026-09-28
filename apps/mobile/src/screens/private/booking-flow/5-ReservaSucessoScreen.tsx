import React from 'react';
import { usePrivateStackNavigation } from '../../../navigation/PrivateNavigator';
import { TelaDeConclusao } from '../../../ui';

export default function ReservaSucessoScreen() {
    const navigation = usePrivateStackNavigation();

    const handleGoToReservations = () => {
        // Volta para as abas, já na de Reservas, sem deixar o fluxo na pilha
        navigation.reset({
            index: 0,
            routes: [{ name: 'Abas', params: { screen: 'Reservas' } }],
        });
    };

    return (
        <TelaDeConclusao
            titulo="Solicitação recebida com sucesso!"
            texto="Enviamos sua solicitação para nossa equipe. Você receberá uma confirmação em breve. Enquanto isso, acompanhe o status na aba Reservas."
            rotuloDoBotao="Ir para minhas reservas"
            aoContinuar={handleGoToReservations}
        />
    );
}
