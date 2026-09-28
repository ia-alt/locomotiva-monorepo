import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useQueryClient } from '@tanstack/react-query';
import { useORPC } from '../../locomotiva-api/context';
import { useAuth } from '../../contexts/auth-context';
import { CheckinProvider } from '../../contexts/checkin-context';
import { useMolduraDaTela } from '../../contexts/layout-context';
import { useCheckinPorCodigo } from '../../hooks/useCheckinPorCodigo';
import type { AbasParamList } from '../../navigation/PrivateNavigator';
import { CabecalhoDaMarca, cores, espaco } from '../../ui';
import { AtalhosDoInicio } from '../../components/inicio/AtalhosDoInicio';
import { PainelDoInicio } from '../../components/inicio/PainelDoInicio';
import { Saudacao } from '../../components/inicio/Saudacao';
import { SecaoDeCheckin } from '../../components/inicio/SecaoDeCheckin';
import { StatusDoHub } from '../../components/inicio/StatusDoHub';

export default function InicioScreen() {
    useMolduraDaTela({ corDoTopo: cores.chao });
    const route = useRoute<RouteProp<AbasParamList, 'Início'>>();
    const navigation = useNavigation<BottomTabNavigationProp<AbasParamList, 'Início'>>();

    // O link do QR code pode chegar com aspas em volta do código.
    const codigo = route.params?.code?.replace(/['"]/g, '');
    const limparCodigo = useCallback(() => navigation.setParams({ code: undefined }), [navigation]);

    return (
        <CheckinProvider>
            <ConteudoDoInicio codigo={codigo} aoUsarCodigo={limparCodigo} />
        </CheckinProvider>
    );
}

function ConteudoDoInicio({ codigo, aoUsarCodigo }: { codigo?: string; aoUsarCodigo: () => void }) {
    const { authUser } = useAuth();
    const orpc = useORPC();
    const queryClient = useQueryClient();
    const [atualizando, setAtualizando] = useState(false);

    useCheckinPorCodigo(codigo, aoUsarCodigo);

    const atualizar = async () => {
        setAtualizando(true);
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: orpc.booking.findMyBookings.key() }),
            queryClient.invalidateQueries({ queryKey: orpc.coworking.getMyCheckinStatus.key() }),
        ]);
        setAtualizando(false);
    };

    return (
        <ScrollView
            style={estilos.tela}
            contentContainerStyle={estilos.conteudo}
            refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizar} />}
        >
            <CabecalhoDaMarca direita={<StatusDoHub />} />
            <View style={estilos.miolo}>
                <Saudacao nome={authUser?.name} />
                <PainelDoInicio style={estilos.painel} />
                <View style={estilos.secao}>
                    <SecaoDeCheckin />
                </View>
                <View style={estilos.secao}>
                    <AtalhosDoInicio />
                </View>
            </View>
        </ScrollView>
    );
}

const estilos = StyleSheet.create({
    tela: { flex: 1, backgroundColor: cores.chao },
    conteudo: { paddingBottom: espaco.xxl },
    miolo: { paddingHorizontal: espaco.l, paddingTop: espaco.s },
    painel: { marginTop: espaco.l },
    secao: { marginTop: espaco.xl },
});
