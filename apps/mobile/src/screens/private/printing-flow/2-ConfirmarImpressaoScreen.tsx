import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { usePrivateStackNavigation, usePrivateStackRoute } from '../../../navigation/PrivateNavigator';
import { Feather } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useORPC } from '../../../locomotiva-api/context';
import { clearPickedFiles, getPickedFile } from '../../../utils/pick-print-file';

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
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.stepIndicator}>
                <View style={styles.stepDone}><Feather name="check" size={16} color="#FFFFFF" /></View>
                <View style={[styles.stepLine, styles.stepLineDone]} />
                <View style={styles.stepActive}><Text style={styles.stepTextActive}>2</Text></View>
            </View>

            <View style={styles.headerInfo}>
                <Feather name="check-circle" size={24} color="#1E88E5" />
                <Text style={styles.headerText}>Revise os dados abaixo. Ao enviar, seus arquivos são anexados ao pedido — pode levar alguns instantes.</Text>
            </View>

            <Surface style={styles.card} elevation={0}>
                <Text style={styles.cardTitle}>Arquivos e material</Text>
                <View style={styles.row}><Text style={styles.label}>Modelo (.stl):</Text><Text style={styles.value} numberOfLines={1}>{stlFile.fileName}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Fatiado (.gcode):</Text><Text style={styles.value} numberOfLines={1}>{gcodeFile.fileName}</Text></View>
                <View style={[styles.row, styles.rowLast]}><Text style={styles.label}>Material:</Text><Text style={styles.value}>{material.toUpperCase()}</Text></View>
            </Surface>

            <Surface style={styles.card} elevation={0}>
                <Text style={styles.cardTitle}>Motivo da impressão</Text>
                <Text style={styles.purposeText}>{purpose}</Text>
            </Surface>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
                style={[styles.confirmButton, isSubmitting && styles.confirmButtonDisabled]}
                disabled={isSubmitting}
                onPress={handleConfirm}
                activeOpacity={0.7}
            >
                <Feather name="send" size={20} color="#FFFFFF" />
                <Text style={styles.confirmButtonText}>{isSubmitting ? 'Enviando arquivos...' : 'Enviar pedido'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    stepDone: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
    stepActive: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1E88E5', alignItems: 'center', justifyContent: 'center' },
    stepLine: { width: 64, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 6 },
    stepLineDone: { backgroundColor: '#10B981' },
    stepTextActive: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
    headerInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', padding: 16, borderRadius: 12, marginBottom: 24, gap: 12 },
    headerText: { flex: 1, fontSize: 14, color: '#1E40AF', lineHeight: 20 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 12, marginBottom: 12 },
    rowLast: { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 },
    label: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
    value: { fontSize: 14, fontWeight: '600', color: '#374151', textAlign: 'right', flexShrink: 1, paddingLeft: 16 },
    purposeText: { fontSize: 14, color: '#374151', lineHeight: 21 },
    errorText: { color: '#EF4444', fontSize: 14, marginBottom: 12, textAlign: 'center' },
    confirmButton: { backgroundColor: '#10B981', borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, marginTop: 8 },
    confirmButtonDisabled: { backgroundColor: '#D1D5DB' },
    confirmButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
});
