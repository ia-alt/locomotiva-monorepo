import React from 'react';
import { ScrollViewProps } from 'react-native';
import { KeyboardAwareScrollView, KeyboardAwareScrollViewProps } from 'react-native-keyboard-controller';

// Folga entre o campo focado e o topo do teclado — cabe a mensagem de erro ou
// de ajuda que fica logo abaixo do campo.
const FOLGA_ACIMA_DO_TECLADO = 32;

/**
 * `ScrollView` para telas com campos de texto. Use no lugar do `ScrollView`
 * sempre que a tela tiver um `TextInput`.
 *
 * No aplicativo, o Android desenha o app de ponta a ponta (edge-to-edge,
 * sempre ligado nas versões recentes do Expo) e por isso não encolhe mais a
 * tela quando o teclado abre: o teclado passa por cima do conteúdo. Este
 * componente rola até o campo focado ficar acima do teclado e acrescenta, no
 * fim do conteúdo, um espaço do tamanho do teclado — assim até o último campo
 * consegue subir, mesmo sem conteúdo sobrando embaixo.
 *
 * Na web o navegador já faz isso sozinho — ver `ScrollComTeclado.web.tsx`.
 * Depende do `KeyboardProvider` em `App.tsx`.
 */
export default function ScrollComTeclado(props: ScrollViewProps) {
    // A biblioteca fica no node_modules da raiz do monorepo, e ali o TypeScript
    // enxerga os tipos de outro react-native (o da raiz, não o do app). No
    // bundle ela usa o mesmo react-native do app: a diferença é só de tipo.
    const propsDaBiblioteca = props as unknown as KeyboardAwareScrollViewProps;
    return (
        <KeyboardAwareScrollView
            bottomOffset={FOLGA_ACIMA_DO_TECLADO}
            keyboardShouldPersistTaps="handled"
            {...propsDaBiblioteca}
        />
    );
}
