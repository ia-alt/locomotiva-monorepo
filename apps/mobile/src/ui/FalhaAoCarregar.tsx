import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Aviso } from './Aviso';
import { Botao } from './Botao';
import { espaco } from './tema';

type Props = {
    mensagem: string;
    aoTentarDeNovo: () => void;
    tentando?: boolean;
};

/**
 * Estado de erro de uma tela que depende de uma consulta: explica o que não
 * carregou e oferece tentar de novo, em vez de deixar a tela girando.
 */
export function FalhaAoCarregar({ mensagem, aoTentarDeNovo, tentando = false }: Props) {
    return (
        <View style={estilos.falha}>
            <Aviso tom="erro" titulo="Algo deu errado">
                {`${mensagem} Confira sua conexão e tente de novo.`}
            </Aviso>
            <Botao titulo="Tentar de novo" variante="contorno" onPress={aoTentarDeNovo} carregando={tentando} />
        </View>
    );
}

const estilos = StyleSheet.create({
    falha: { alignSelf: 'stretch', gap: espaco.l, paddingHorizontal: espaco.l },
});
