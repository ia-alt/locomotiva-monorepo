import React from 'react';
import { StyleSheet } from 'react-native';
import { Texto, cores, fontes } from '../../ui';

/** Frase de aceite do cadastro, com os links para os Termos e a Política no meio do texto. */
export function AceiteDosTermos({ aoAbrirTermos, aoAbrirPolitica }: {
    aoAbrirTermos: () => void;
    aoAbrirPolitica: () => void;
}) {
    return (
        <Texto variante="apoio" cor={cores.textoSecundario} style={estilos.centralizado}>
            Ao criar uma conta, você concorda com os nossos{' '}
            <Texto variante="apoio" cor={cores.azulTexto} style={estilos.link} accessibilityRole="link" onPress={aoAbrirTermos}>
                Termos de Serviço
            </Texto>
            {' e '}
            <Texto variante="apoio" cor={cores.azulTexto} style={estilos.link} accessibilityRole="link" onPress={aoAbrirPolitica}>
                Política de Privacidade
            </Texto>
            .
        </Texto>
    );
}

const estilos = StyleSheet.create({
    centralizado: { textAlign: 'center' },
    link: { fontFamily: fontes.negrito },
});
