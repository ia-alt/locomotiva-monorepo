import React, { useMemo } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Dialog, DialogProps, Portal } from 'react-native-paper';
import { useKeyboardAnimation } from 'react-native-keyboard-controller';

/**
 * `Dialog` do Paper, já dentro do `Portal`, para diálogos com campo de texto.
 * Use no lugar de `<Portal><Dialog>` quando o diálogo tiver um `TextInput`.
 *
 * O diálogo fica no centro da tela, e com o teclado aberto o centro cai atrás
 * dele. Aqui o diálogo sobe metade da altura do teclado, acompanhando a
 * animação, e fica centralizado na área que sobra acima do teclado.
 *
 * Na web a altura do teclado é sempre zero e nada muda. Depende do
 * `KeyboardProvider` em `App.tsx`, que por isso fica acima do `PaperProvider`
 * (é no `PaperProvider` que o `Portal` renderiza).
 */
export default function DialogComTeclado({ children, ...props }: DialogProps) {
    // `height` vai de 0 a -alturaDoTeclado enquanto o teclado abre.
    const { height } = useKeyboardAnimation();
    const deslocamento = useMemo(() => Animated.multiply(height, 0.5), [height]);

    return (
        <Portal>
            <Animated.View style={[styles.camada, { transform: [{ translateY: deslocamento }] }]}>
                <Dialog {...props}>{children}</Dialog>
            </Animated.View>
        </Portal>
    );
}

const styles = StyleSheet.create({
    camada: {
        ...StyleSheet.absoluteFillObject,
        pointerEvents: 'box-none',
    },
});
