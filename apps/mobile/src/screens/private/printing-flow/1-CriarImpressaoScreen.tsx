import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import ScrollComTeclado from '../../../components/ScrollComTeclado';
import { usePrivateStackNavigation } from '../../../navigation/PrivateNavigator';
import { useQuery } from '@tanstack/react-query';
import { useORPC } from '../../../locomotiva-api/context';
import { clearPickedFiles, pickPrintFile, type PickedPrintFile, type PrintFileKind } from '../../../utils/pick-print-file';
import { Aviso, Botao, Campo, Trajeto, cores, espaco } from '../../../ui';
import { EnvioDeArquivo } from '../../../components/impressoes/EnvioDeArquivo';
import { EscolhaDeMaterial } from '../../../components/impressoes/EscolhaDeMaterial';

const PURPOSE_MIN = 5;
const PURPOSE_MAX = 500;

const ETAPAS = ['Arquivos', 'Confirmar'] as const;

export default function CriarImpressaoScreen() {
    const navigation = usePrivateStackNavigation();
    const orpc = useORPC();

    const [stlFile, setStlFile] = useState<PickedPrintFile | null>(null);
    const [gcodeFile, setGcodeFile] = useState<PickedPrintFile | null>(null);
    const [material, setMaterial] = useState<{ id: string; name: string } | null>(null);
    const [purpose, setPurpose] = useState('');
    const [error, setError] = useState<string | null>(null);

    // começo de fluxo: nenhum arquivo escolhido antes pode sobrar aqui
    useEffect(() => clearPickedFiles(), []);

    const { data: filaments = [], isLoading: filamentsLoading } = useQuery(
        orpc.printing.listFilaments.queryOptions({ input: {} })
    );

    const handlePickFile = async (kind: PrintFileKind) => {
        setError(null);
        try {
            const picked = await pickPrintFile(kind);
            if (picked) {
                if (kind === 'stl') setStlFile(picked);
                else setGcodeFile(picked);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erro ao anexar o arquivo.');
        }
    };

    const purposeValid = purpose.trim().length >= PURPOSE_MIN && purpose.trim().length <= PURPOSE_MAX;
    const canAdvance = !!stlFile && !!gcodeFile && !!material && purposeValid;

    return (
        <ScrollComTeclado style={estilos.tela} contentContainerStyle={estilos.conteudo}>
            <Trajeto paradas={ETAPAS} atual={0} />

            <Aviso tom="info">
                Anexe o modelo 3D (.stl) e o arquivo já fatiado (.gcode), escolha o material e conte pra gente o motivo da impressão. Os arquivos são enviados só quando você confirmar o pedido.
            </Aviso>

            <EnvioDeArquivo
                rotulo="Modelo 3D (.stl)"
                chamada="Anexar arquivo .stl"
                arquivo={stlFile}
                aoEscolher={() => handlePickFile('stl')}
            />

            <EnvioDeArquivo
                rotulo="Arquivo fatiado (.gcode)"
                chamada="Anexar arquivo .gcode"
                arquivo={gcodeFile}
                aoEscolher={() => handlePickFile('gcode')}
            />

            {error ? <Aviso tom="erro">{error}</Aviso> : null}

            <EscolhaDeMaterial
                materiais={filaments}
                carregando={filamentsLoading}
                escolhido={material?.id ?? null}
                aoEscolher={(f) => setMaterial({ id: f.id, name: f.name })}
            />

            <Campo
                rotulo="Motivo da impressão"
                multiline
                numberOfLines={4}
                maxLength={PURPOSE_MAX}
                maximo={PURPOSE_MAX}
                ajuda={purpose.trim().length < PURPOSE_MIN ? `Mínimo de ${PURPOSE_MIN} caracteres` : undefined}
                placeholder="Descreva para que você precisa desta impressão..."
                value={purpose}
                onChangeText={setPurpose}
            />

            <Botao
                titulo="Avançar"
                icone="seguir"
                iconeNoFim
                tamanho="alto"
                desabilitado={!canAdvance}
                onPress={() =>
                    stlFile && gcodeFile && material &&
                    navigation.navigate('ConfirmarImpressao', { stlFile, gcodeFile, filamentId: material.id, material: material.name, purpose: purpose.trim() })
                }
            />
        </ScrollComTeclado>
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
