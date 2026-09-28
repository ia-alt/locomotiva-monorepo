import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useCheckin } from '../../contexts/checkin-context';
import { useQRCodeReader } from '../../contexts/qr-code-reader';
import { horaEMinuto } from '../../hooks/useCronometro';
import { Botao, Texto, cores } from '../../ui';
import { extrairCodigoDeAcesso } from '../../utils/codigo-de-acesso';

/** Chamada para o check-in (lendo o QR code da recepção) ou para o check-out. */
export function SecaoDeCheckin() {
    const { isCheckedIn, checkInTime, isLoading, checkIn, checkOut } = useCheckin();
    const { openReader } = useQRCodeReader();
    const [enviando, setEnviando] = useState(false);

    const executar = async (acao: () => Promise<void>) => {
        setEnviando(true);
        try {
            await acao();
        } catch {
            // O aviso de erro já sai pelo MutationCache global (App.tsx).
        } finally {
            setEnviando(false);
        }
    };

    const fazerCheckin = () => {
        openReader((lido) => executar(() => checkIn(extrairCodigoDeAcesso(lido))));
    };

    if (isCheckedIn && checkInTime) {
        return (
            <View style={estilos.secao}>
                <View style={estilos.textos}>
                    <Texto variante="secao">Check-in feito às {horaEMinuto(checkInTime)}</Texto>
                    <Texto variante="explicacao" cor={cores.textoSecundario}>
                        Na hora de ir embora, registre sua saída aqui.
                    </Texto>
                </View>
                <Botao
                    titulo="Fazer check-out"
                    variante="contorno"
                    tamanho="alto"
                    icone="sair"
                    onPress={() => executar(checkOut)}
                    carregando={enviando}
                />
            </View>
        );
    }

    return (
        <View style={estilos.secao}>
            <View style={estilos.textos}>
                <Texto variante="secao">Chegou ao hub?</Texto>
                <Texto variante="explicacao" cor={cores.textoSecundario}>
                    Escaneie o QR code da recepção para registrar sua entrada.
                </Texto>
            </View>
            <Botao
                titulo="Fazer check-in"
                tamanho="alto"
                icone="qrcode"
                onPress={fazerCheckin}
                carregando={enviando}
                desabilitado={isLoading}
            />
        </View>
    );
}

const estilos = StyleSheet.create({
    secao: { gap: 12 },
    textos: { gap: 4 },
});
