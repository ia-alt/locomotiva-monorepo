import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { usePrivateStackNavigation } from '../../../navigation/PrivateNavigator';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useORPC } from '../../../locomotiva-api/context';
import { clearPickedFiles, pickPrintFile, type PickedPrintFile, type PrintFileKind } from '../../../utils/pick-print-file';

const PURPOSE_MIN = 5;
const PURPOSE_MAX = 500;

type FileSlotProps = {
    label: string;
    hint: string;
    file: PickedPrintFile | null;
    onPick: () => void;
};

function FileSlot({ label, hint, file, onPick }: FileSlotProps) {
    return (
        <View style={styles.formGroup}>
            <Text style={styles.label}>{label}</Text>
            {file ? (
                <View style={styles.fileCard}>
                    <Feather name="file" size={20} color="#10B981" />
                    <Text style={styles.fileName} numberOfLines={1}>{file.fileName}</Text>
                    <TouchableOpacity onPress={onPick}>
                        <Text style={styles.changeLink}>Trocar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity style={styles.uploadBox} onPress={onPick} activeOpacity={0.7}>
                    <Feather name="upload-cloud" size={28} color="#1E88E5" />
                    <Text style={styles.uploadText}>{hint}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

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
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.stepIndicator}>
                <View style={styles.stepActive}><Text style={styles.stepTextActive}>1</Text></View>
                <View style={styles.stepLine} />
                <View style={styles.stepTodo}><Text style={styles.stepTextTodo}>2</Text></View>
            </View>

            <View style={styles.headerInfo}>
                <Feather name="info" size={24} color="#1E88E5" />
                <Text style={styles.headerText}>
                    Anexe o modelo 3D (.stl) e o arquivo já fatiado (.gcode), escolha o material e conte pra gente o motivo da impressão. Os arquivos são enviados só quando você confirmar o pedido.
                </Text>
            </View>

            <FileSlot
                label="Modelo 3D (.stl)"
                hint="Anexar arquivo .stl"
                file={stlFile}
                onPick={() => handlePickFile('stl')}
            />

            <FileSlot
                label="Arquivo fatiado (.gcode)"
                hint="Anexar arquivo .gcode"
                file={gcodeFile}
                onPick={() => handlePickFile('gcode')}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.formGroup}>
                <Text style={styles.label}>Material</Text>
                {filamentsLoading ? (
                    <ActivityIndicator color="#1E88E5" style={{ marginTop: 8 }} />
                ) : filaments.length === 0 ? (
                    <Text style={styles.emptyMaterials}>Nenhum material disponível no momento. Fale com a equipe do Locomotiva Hub.</Text>
                ) : (
                    <View style={styles.materialRow}>
                        {filaments.map((f) => {
                            const selected = material?.id === f.id;
                            return (
                                <TouchableOpacity
                                    key={f.id}
                                    style={[styles.materialButton, selected && styles.materialButtonSelected]}
                                    onPress={() => setMaterial({ id: f.id, name: f.name })}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.materialText, selected && styles.materialTextSelected]}>{f.name.toUpperCase()}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Motivo da impressão</Text>
                <TextInput
                    style={styles.textArea}
                    multiline
                    numberOfLines={4}
                    maxLength={PURPOSE_MAX}
                    placeholder="Descreva para que você precisa desta impressão..."
                    placeholderTextColor="#9CA3AF"
                    value={purpose}
                    onChangeText={setPurpose}
                />
                <Text style={styles.charCount}>
                    {purpose.trim().length < PURPOSE_MIN
                        ? `Mínimo de ${PURPOSE_MIN} caracteres`
                        : `${purpose.length}/${PURPOSE_MAX}`}
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.nextButton, !canAdvance && styles.nextButtonDisabled]}
                disabled={!canAdvance}
                onPress={() =>
                    stlFile && gcodeFile && material &&
                    navigation.navigate('ConfirmarImpressao', { stlFile, gcodeFile, filamentId: material.id, material: material.name, purpose: purpose.trim() })
                }
                activeOpacity={0.7}
            >
                <Text style={styles.nextButtonText}>Avançar</Text>
                <Feather name="arrow-right" size={20} color="#FFFFFF" />
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    scrollContent: { padding: 20, paddingBottom: 64 },
    stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    stepActive: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1E88E5', alignItems: 'center', justifyContent: 'center' },
    stepTodo: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
    stepLine: { width: 64, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 6 },
    stepTextActive: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
    stepTextTodo: { color: '#9CA3AF', fontWeight: 'bold', fontSize: 14 },
    headerInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', padding: 16, borderRadius: 12, marginBottom: 24, gap: 12 },
    headerText: { flex: 1, fontSize: 14, color: '#1E40AF', lineHeight: 20 },
    formGroup: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
    uploadBox: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#BFDBFE', borderStyle: 'dashed', borderRadius: 12, paddingVertical: 24, alignItems: 'center', justifyContent: 'center', gap: 8 },
    uploadText: { fontSize: 15, color: '#1E88E5', fontWeight: '600' },
    fileCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14 },
    fileName: { flex: 1, fontSize: 15, color: '#111827', fontWeight: '500' },
    changeLink: { color: '#1E88E5', fontWeight: '600' },
    errorText: { color: '#EF4444', fontSize: 13, marginTop: -12, marginBottom: 20 },
    materialRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    materialButton: { minWidth: '30%', flexGrow: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingVertical: 18, paddingHorizontal: 12, alignItems: 'center' },
    materialButtonSelected: { borderColor: '#1E88E5', backgroundColor: '#EFF6FF' },
    materialText: { fontSize: 16, fontWeight: '700', color: '#6B7280' },
    materialTextSelected: { color: '#1E88E5' },
    emptyMaterials: { fontSize: 14, color: '#B45309', backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8 },
    textArea: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, minHeight: 110, fontSize: 15, color: '#111827', textAlignVertical: 'top' },
    charCount: { fontSize: 12, color: '#9CA3AF', marginTop: 6, textAlign: 'right' },
    nextButton: { backgroundColor: '#1E88E5', borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, marginTop: 8 },
    nextButtonDisabled: { backgroundColor: '#9CA3AF' },
    nextButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
});
