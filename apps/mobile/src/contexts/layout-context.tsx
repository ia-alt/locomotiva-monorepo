import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Moldura = as faixas que o sistema reserva em volta do app (barra de status
 * em cima, barra de gestos / home indicator embaixo). Cada tela pode pintar
 * essas faixas com a própria cor, para não sobrar uma tira de outra cor, ou
 * desenhar por baixo da barra de status (foto de capa, por exemplo).
 */
type Moldura = {
    corDoTopo?: string;
    corDaBase?: string;
    sobOTopo?: boolean;
};

/**
 * Controla se o wrapper global (App.tsx) deve limitar a largura em MAX_WIDTH
 * ou deixar a tela atual ocupar a viewport inteira ("full bleed"), e as cores
 * da moldura.
 */
type LayoutContextValue = {
    fullBleed: boolean;
    setFullBleed: (value: boolean) => void;
    moldura: Moldura;
    ajustarMoldura: (parcial: Moldura) => void;
};

const LayoutContext = createContext<LayoutContextValue>({
    fullBleed: false,
    setFullBleed: () => {},
    moldura: {},
    ajustarMoldura: () => {},
});

export function LayoutProvider({ children }: { children: React.ReactNode }) {
    const [fullBleed, setFullBleed] = useState(false);
    const [moldura, setMoldura] = useState<Moldura>({});
    const ajustarMoldura = useCallback((parcial: Moldura) => {
        setMoldura((atual) => ({ ...atual, ...parcial }));
    }, []);
    const value = useMemo(
        () => ({ fullBleed, setFullBleed, moldura, ajustarMoldura }),
        [fullBleed, moldura, ajustarMoldura],
    );
    return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout() {
    return useContext(LayoutContext);
}

/**
 * Chame dentro de uma screen do react-navigation para que, enquanto ela
 * estiver focada, o wrapper global não aplique o limite de largura.
 */
export function useFullBleedScreen() {
    const { setFullBleed } = useLayout();
    useFocusEffect(
        useCallback(() => {
            setFullBleed(true);
            return () => setFullBleed(false);
        }, [setFullBleed]),
    );
}

/**
 * Enquanto a tela estiver focada, pinta a faixa da barra de status com
 * `corDoTopo`, ou deixa o conteúdo passar por baixo dela (`sobOTopo`).
 */
export function useMolduraDaTela({ corDoTopo, sobOTopo = false }: { corDoTopo?: string; sobOTopo?: boolean }) {
    const { ajustarMoldura } = useLayout();
    useFocusEffect(
        useCallback(() => {
            ajustarMoldura({ corDoTopo, sobOTopo });
            return () => ajustarMoldura({ corDoTopo: undefined, sobOTopo: false });
        }, [ajustarMoldura, corDoTopo, sobOTopo]),
    );
}

/** Pinta a faixa de baixo (gestos / home indicator). `undefined` volta ao padrão. */
export function useCorDaBaseDaMoldura(cor: string | undefined) {
    const { ajustarMoldura } = useLayout();
    useEffect(() => {
        ajustarMoldura({ corDaBase: cor });
        return () => ajustarMoldura({ corDaBase: undefined });
    }, [ajustarMoldura, cor]);
}

/**
 * Substitui o SafeAreaView do topo do app: aplica as mesmas margens seguras,
 * mas com as cores que a tela atual pediu. Sem pedido, tudo fica `corPadrao`,
 * igual ao SafeAreaView de antes.
 */
export function MolduraSegura({ corPadrao, children }: { corPadrao: string; children: React.ReactNode }) {
    const insets = useSafeAreaInsets();
    const { moldura } = useLayout();

    return (
        <View style={{ flex: 1, backgroundColor: corPadrao, paddingLeft: insets.left, paddingRight: insets.right }}>
            {moldura.sobOTopo ? null : (
                <View style={{ height: insets.top, backgroundColor: moldura.corDoTopo ?? corPadrao }} />
            )}
            <View style={{ flex: 1 }}>{children}</View>
            <View style={{ height: insets.bottom, backgroundColor: moldura.corDaBase ?? corPadrao }} />
        </View>
    );
}
