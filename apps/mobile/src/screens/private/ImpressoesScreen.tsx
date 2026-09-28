import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ImpressoesProvider, useImpressoes } from '../../contexts/ImpressoesContext';
import { useAuth } from '../../contexts/auth-context';
import { useMolduraDaTela } from '../../contexts/layout-context';
import { usePrivateStackNavigation } from '../../navigation/PrivateNavigator';
import { Botao, Texto, cores, espaco } from '../../ui';
import { CartaoDaImpressao } from '../../components/impressoes/CartaoDaImpressao';
import { perfilEstaCompleto } from '../../utils/perfil';

export default function ImpressoesScreen() {
    return (
        <ImpressoesProvider>
            <ListaDeImpressoes />
        </ImpressoesProvider>
    );
}

function ListaDeImpressoes() {
    useMolduraDaTela({ corDoTopo: cores.chao });
    const navigation = usePrivateStackNavigation();
    const { authUser } = useAuth();
    const {
        printRequests,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
        isRefetching,
    } = useImpressoes();

    const novaImpressao = () => {
        if (perfilEstaCompleto(authUser)) navigation.navigate('CriarImpressao');
        else navigation.navigate('PerfilIncompleto', { next: 'CriarImpressao' });
    };

    return (
        <View style={estilos.tela}>
            <View style={estilos.cabecalho}>
                <Texto variante="titulo" accessibilityRole="header">Impressões</Texto>
                {/* "Nova impressão" inteiro não cabe ao lado do título em telas de 360 a 412 dp. */}
                <Botao
                    titulo="Nova"
                    accessibilityLabel="Nova impressão"
                    icone="mais"
                    tamanho="compacto"
                    onPress={novaImpressao}
                    accessibilityHint="Faz um novo pedido de impressão 3D"
                />
            </View>

            <FlatList
                data={printRequests}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <CartaoDaImpressao
                        pedido={item}
                        onPress={() => navigation.navigate('DetalhesMinhaImpressao', { printRequestId: item.id })}
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
                        : <ListaVazia />
                }
                ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={estilos.carregando} color={cores.azul} /> : null}
            />
        </View>
    );
}

function Separador() {
    return <View style={estilos.separador} />;
}

function ListaVazia() {
    return (
        <View style={estilos.vazia}>
            <Texto variante="destaque">Nenhum pedido por aqui</Texto>
            <Texto variante="explicacao" cor={cores.textoSecundario} style={estilos.centralizado}>
                Você ainda não fez nenhum pedido de impressão.
            </Texto>
        </View>
    );
}

const estilos = StyleSheet.create({
    tela: { flex: 1, backgroundColor: cores.chao },
    cabecalho: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: espaco.m,
        paddingHorizontal: espaco.l,
        paddingTop: espaco.s,
    },
    lista: { paddingHorizontal: espaco.l, paddingTop: espaco.xl, paddingBottom: espaco.xxl, flexGrow: 1 },
    separador: { height: espaco.m },
    carregando: { marginTop: espaco.xxl },
    vazia: { alignItems: 'center', gap: 6, paddingTop: 48, paddingHorizontal: espaco.xxl },
    centralizado: { textAlign: 'center' },
});
