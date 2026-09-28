import React, { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useAuth } from '../../contexts/auth-context';
import { useMolduraDaTela } from '../../contexts/layout-context';
import { AbaDeReservas, useMinhasReservas } from '../../hooks/useReservas';
import { usePrivateStackNavigation } from '../../navigation/PrivateNavigator';
import { Botao, Segmentado, Texto, cores, espaco } from '../../ui';
import { BilheteDaReserva } from '../../components/reservas/BilheteDaReserva';
import { perfilEstaCompleto } from '../../utils/perfil';

const ABAS = [
    { valor: 'proximas', rotulo: 'Próximas' },
    { valor: 'anteriores', rotulo: 'Anteriores' },
] as const;

const TEXTO_VAZIO: Record<AbaDeReservas, { titulo: string; detalhe: string }> = {
    proximas: {
        titulo: 'Nenhuma reserva marcada',
        detalhe: 'Quando você reservar uma sala, o bilhete aparece aqui.',
    },
    anteriores: {
        titulo: 'Nada por aqui ainda',
        detalhe: 'As reservas que já passaram ficam guardadas aqui.',
    },
};

export default function ReservasScreen() {
    useMolduraDaTela({ corDoTopo: cores.chao });
    const navigation = usePrivateStackNavigation();
    const { authUser } = useAuth();
    const [aba, setAba] = useState<AbaDeReservas>('proximas');
    const {
        reservas,
        isLoading,
        isRefetching,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useMinhasReservas(aba);

    const novaReserva = () => {
        if (perfilEstaCompleto(authUser)) navigation.navigate('CriarReserva');
        else navigation.navigate('PerfilIncompleto', { next: 'CriarReserva' });
    };

    return (
        <View style={estilos.tela}>
            <View style={estilos.cabecalho}>
                <Texto variante="titulo" accessibilityRole="header">Reservas</Texto>
                <Botao titulo="Nova" accessibilityLabel="Nova reserva" icone="mais" tamanho="compacto" onPress={novaReserva} />
            </View>

            <View style={estilos.abas}>
                <Segmentado opcoes={ABAS} valor={aba} aoMudar={setAba} accessibilityLabel="Filtrar reservas" />
            </View>

            <FlatList
                data={reservas}
                keyExtractor={(reserva) => reserva.id}
                renderItem={({ item }) => (
                    <BilheteDaReserva
                        reserva={item}
                        onPress={() => navigation.navigate('DetalhesMinhaReserva', { bookingId: item.id })}
                    />
                )}
                ItemSeparatorComponent={Separador}
                contentContainerStyle={estilos.lista}
                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                }}
                onEndReachedThreshold={0.5}
                refreshControl={<RefreshControl refreshing={isRefetching && !isLoading} onRefresh={refetch} />}
                ListEmptyComponent={
                    isLoading
                        ? <ActivityIndicator style={estilos.carregando} color={cores.azul} />
                        : <ListaVazia aba={aba} />
                }
                ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={estilos.carregando} color={cores.azul} /> : null}
            />
        </View>
    );
}

function Separador() {
    return <View style={estilos.separador} />;
}

function ListaVazia({ aba }: { aba: AbaDeReservas }) {
    const texto = TEXTO_VAZIO[aba];
    return (
        <View style={estilos.vazia}>
            <Texto variante="destaque">{texto.titulo}</Texto>
            <Texto variante="explicacao" cor={cores.textoSecundario} style={estilos.centralizado}>
                {texto.detalhe}
            </Texto>
        </View>
    );
}

const estilos = StyleSheet.create({
    tela: { flex: 1, backgroundColor: cores.chao },
    cabecalho: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: espaco.m,
        paddingHorizontal: espaco.l,
        paddingTop: espaco.s,
    },
    abas: { paddingHorizontal: espaco.l, paddingTop: 18 },
    lista: { paddingHorizontal: espaco.l, paddingTop: 18, paddingBottom: espaco.xxl, flexGrow: 1 },
    separador: { height: espaco.m },
    carregando: { marginTop: espaco.xxl },
    vazia: { alignItems: 'center', gap: 6, paddingTop: 48, paddingHorizontal: espaco.xxl },
    centralizado: { textAlign: 'center' },
});
