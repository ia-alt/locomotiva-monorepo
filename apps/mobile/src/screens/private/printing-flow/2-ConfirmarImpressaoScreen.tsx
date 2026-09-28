import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { usePrivateStackNavigation, usePrivateStackRoute } from '../../../navigation/PrivateNavigator';
import { useMutation } from '@tanstack/react-query';
import { useORPC } from '../../../locomotiva-api/context';
import { clearPickedFiles, getPickedFile } from '../../../utils/pick-print-file';
import { Aviso, Botao, Cartao, LinhaDeInformacao, Texto, Trajeto, cores, espaco } from '../../../ui';

const ETAPAS = ['Arquivos', 'Confirmar'] as const;

export default function ConfirmarImpressaoScreen() {
    const navigation = usePrivateStackNavigation();
    const route = usePrivateStackRoute<"ConfirmarImpressao">();
    const orpc = useORPC();

    const { stlFile, gcodeFile, filamentId, material, purpose } = route.params;

    const { mutateAsync: requestPrint } = useMutation(orpc.printing.requestPrint.mutationOptions());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        // é aqui que os arquivos sobem: até confirmar, nada foi parar no storage
        const stl = getPickedFile('stl');
        const gcode = getPickedFile('gcode');
        if (!stl || !gcode) {
            setError('Os arquivos não estão mais disponíveis. Volte e anexe novamente.');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            await requestPrint({
                purpose,
                filamentId,
                stlFile: stl,
                stlFileName: stlFile.fileName,
                gcodeFile: gcode,
                gcodeFileName: gcodeFile.fileName,
            });
            clearPickedFiles();
            // replace: voltar da tela de sucesso não pode reabrir a confirmação (evita pedido duplicado)
            navigation.replace('ImpressaoSucesso');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Não foi possível enviar o pedido.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
            <Trajeto paradas={ETAPAS} atual={1} />

            <Aviso tom="info">
                Revise os dados abaixo. Ao enviar, seus arquivos são anexados ao pedido, o que pode levar alguns instantes.
            </Aviso>

            <Cartao titulo="Resumo do pedido">
                <LinhaDeInformacao icone="impressoes" rotulo="Modelo 3D (.stl)" valor={stlFile.fileName} />
                <LinhaDeInformacao icone="arquivo" rotulo="Arquivo fatiado (.gcode)" valor={gcodeFile.fileName} />
                <LinhaDeInformacao icone="camadas" rotulo="Material" valor={material.toUpperCase()} />
                <LinhaDeInformacao
                    icone="info"
                    rotulo="Motivo da impressão"
                    valor={<Texto variante="corpo">{purpose}</Texto>}
                />
            </Cartao>

            {error ? <Aviso tom="erro">{error}</Aviso> : null}

            <Botao
                titulo={isSubmitting ? 'Enviando arquivos...' : 'Enviar pedido'}
                icone="enviarArquivo"
                tamanho="alto"
                desabilitado={isSubmitting}
                onPress={handleConfirm}
            />
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
});
