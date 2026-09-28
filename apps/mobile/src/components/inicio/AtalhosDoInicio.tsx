import React from 'react';
import { useAuth } from '../../contexts/auth-context';
import { usePrivateStackNavigation } from '../../navigation/PrivateNavigator';
import { GrupoDeAcoes, ItemDeAcao } from '../../ui';
import { perfilEstaCompleto } from '../../utils/perfil';

/** Atalhos para começar uma reserva ou um pedido de impressão 3D. */
export function AtalhosDoInicio() {
    const navigation = usePrivateStackNavigation();
    const { authUser } = useAuth();

    // Sem empresa, cargo e telefone, a pessoa completa o perfil antes e segue
    // para o fluxo que escolheu.
    const abrir = (destino: 'CriarReserva' | 'CriarImpressao') => {
        if (perfilEstaCompleto(authUser)) navigation.navigate(destino);
        else navigation.navigate('PerfilIncompleto', { next: destino });
    };

    return (
        <GrupoDeAcoes>
            <ItemDeAcao
                icone="reservas"
                titulo="Reservar uma sala"
                descricao="Coworking, reunião ou laboratório"
                onPress={() => abrir('CriarReserva')}
            />
            <ItemDeAcao
                icone="impressoes"
                titulo="Pedir impressão 3D"
                descricao="Envie seu modelo em .stl"
                onPress={() => abrir('CriarImpressao')}
            />
        </GrupoDeAcoes>
    );
}
