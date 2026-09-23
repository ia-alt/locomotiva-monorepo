import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Controla se o wrapper global (App.tsx) deve limitar a largura em MAX_WIDTH
 * ou deixar a tela atual ocupar a viewport inteira ("full bleed").
 */
type LayoutContextValue = {
    fullBleed: boolean;
    setFullBleed: (value: boolean) => void;
};

const LayoutContext = createContext<LayoutContextValue>({
    fullBleed: false,
    setFullBleed: () => {},
});

export function LayoutProvider({ children }: { children: React.ReactNode }) {
    const [fullBleed, setFullBleed] = useState(false);
    const value = useMemo(() => ({ fullBleed, setFullBleed }), [fullBleed]);
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
