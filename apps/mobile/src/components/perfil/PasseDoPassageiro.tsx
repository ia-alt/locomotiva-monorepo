import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ORPCOutputs } from '../../locomotiva-api/types';
import { Painel, Texto, cores, espaco } from '../../ui';
import { iniciais } from './formatos-do-perfil';

type Usuario = ORPCOutputs['identy']['getMe'];

const TAMANHO_DAS_INICIAIS = 56;
const ALTURA_DA_FAIXA = 6;

/**
 * Passe do passageiro no topo do perfil: cartão escuro do painel de estação
 * com as iniciais e o nome. E-mail e CPF ficam só no cartão de informações
 * logo abaixo, para não repetir.
 */
export function PasseDoPassageiro({ usuario }: { usuario: Usuario | null }) {
    const nome = usuario?.name ?? 'Usuário';

    return (
        <Painel style={estilos.passe}>
            <View style={estilos.identidade} accessible accessibilityLabel={nome}>
                <View style={estilos.iniciais}>
                    <Texto variante="secao" cor={cores.papel}>{iniciais(usuario?.name)}</Texto>
                </View>
                <Texto variante="secao" cor={cores.papel} numberOfLines={2} style={estilos.nome}>
                    {nome}
                </Texto>
            </View>
            <View style={estilos.faixa} />
        </Painel>
    );
}

const estilos = StyleSheet.create({
    passe: { overflow: 'hidden', paddingBottom: espaco.l + ALTURA_DA_FAIXA },
    identidade: { flexDirection: 'row', alignItems: 'center', gap: espaco.l },
    iniciais: {
        width: TAMANHO_DAS_INICIAIS,
        height: TAMANHO_DAS_INICIAIS,
        borderRadius: TAMANHO_DAS_INICIAIS / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: cores.azul,
    },
    nome: { flex: 1 },
    faixa: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: ALTURA_DA_FAIXA,
        backgroundColor: cores.azul,
    },
});
