import React from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';

/**
 * Na web o navegador já rola até o campo focado quando o teclado virtual
 * abre, então basta o `ScrollView` comum — a web continua exatamente como
 * antes. Ver `ScrollComTeclado.tsx`.
 */
export default function ScrollComTeclado(props: ScrollViewProps) {
    return <ScrollView keyboardShouldPersistTaps="handled" {...props} />;
}
