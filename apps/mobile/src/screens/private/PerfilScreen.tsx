import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/auth-context';
import { useMolduraDaTela } from '../../contexts/layout-context';
import { usePrivateStackNavigation } from '../../navigation/PrivateNavigator';
import { GrupoDeAcoes, ItemDeAcao, Texto, cores, espaco, Botao } from '../../ui';
import { InformacoesDoPerfil } from '../../components/perfil/InformacoesDoPerfil';
import { PasseDoPassageiro } from '../../components/perfil/PasseDoPassageiro';
import { version } from '../../../package.json';

export default function PerfilScreen() {
    useMolduraDaTela({ corDoTopo: cores.chao });
    const { authUser, logout } = useAuth();
    const navigation = usePrivateStackNavigation();

    return (
        <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
            <Texto variante="titulo" accessibilityRole="header">Perfil</Texto>

            <PasseDoPassageiro usuario={authUser} />

            <InformacoesDoPerfil usuario={authUser} />

            <GrupoDeAcoes>
                <ItemDeAcao icone="editar" titulo="Editar perfil" onPress={() => navigation.navigate('EditarPerfil')} />
                <ItemDeAcao icone="cadeado" titulo="Alterar senha" onPress={() => navigation.navigate('AlterarSenha')} />
            </GrupoDeAcoes>

            <Botao titulo="Sair da conta" variante="perigo" icone="sair" onPress={() => logout()} />

            <Texto variante="rotulo" cor={cores.textoApagado} style={estilos.versao}>v{version}</Texto>
        </ScrollView>
    );
}

const estilos = StyleSheet.create({
    tela: { flex: 1, backgroundColor: cores.chao },
    conteudo: {
        gap: espaco.xl,
        paddingHorizontal: espaco.l,
        paddingTop: espaco.s,
        paddingBottom: espaco.xxl,
    },
    versao: { textAlign: 'center' },
});
