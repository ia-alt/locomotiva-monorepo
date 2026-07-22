import React, { useLayoutEffect, useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Surface, Dialog, Portal, Button } from 'react-native-paper';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { PrivateStackParamList } from '../../navigation/PrivateNavigator';
import { Feather } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useORPC } from '../../locomotiva-api/context';
import { USER_STATUS_CONFIG } from '../../components/PrintRequestCard';

type Props = RouteProp<PrivateStackParamList, 'DetalhesMinhaImpressao'>;

export default function DetalhesMinhaImpressaoScreen() {
    const route = useRoute<Props>();
    const navigation = useNavigation();
    const queryClient = useQueryClient();
    const { printRequestId } = route.params;
    const orpc = useORPC();

    const [isCancelDialogVisible, setIsCancelDialogVisible] = useState(false);

    const { data: printRequest, isLoading } = useQuery(
        orpc.printing.getPrintRequestById.queryOptions({ input: { printRequestId } })
    );

    const { mutateAsync: cancelPrintRequest, isPending: isCanceling } = useMutation({
        mutationFn: orpc.printing.cancelPrintRequest.mutationOptions().mutationFn,
        onSuccess: () => {
            // a lista usa a queryKey manual do ImpressoesContext; o detalhe usa a key do orpc
            queryClient.invalidateQueries({ queryKey: ['my-print-requests'] });
            queryClient.invalidateQueries({ queryKey: orpc.printing.getPrintRequestById.key({ input: { printRequestId } }) });
        },
    });

    const handleCancel = useCallback(() => setIsCancelDialogVisible(true), []);

    const confirmCancel = async () => {
        if (!printRequest) return;
        setIsCancelDialogVisible(false);
        try {
            await cancelPrintRequest({ printRequestId: printRequest.id });
        } catch (e) {
            console.error(e);
        }
    };

    useLayoutEffect(() => {
        const cancelable = printRequest && (printRequest.status === 'pending' || printRequest.status === 'approved');
        navigation.setOptions({
            headerRight: cancelable
                ? () => (
                    <TouchableOpacity onPress={handleCancel} disabled={isCanceling} style={{ marginRight: 8, padding: 8 }}>
                        {isCanceling ? <ActivityIndicator size="small" color="#DC2626" /> : <Text style={{ color: '#DC2626', fontWeight: 'bold' }}>Cancelar</Text>}
                    </TouchableOpacity>
                )
                : undefined,
        });
    }, [navigation, printRequest?.status, isCanceling, handleCancel]);

    if (isLoading || !printRequest) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#1E88E5" />
            </View>
        );
    }

    const config = USER_STATUS_CONFIG[printRequest.status] || USER_STATUS_CONFIG.pending;
    const showReason = ['cancelled', 'rejected', 'discarded'].includes(printRequest.status) && !!printRequest.rejectionCancelReason;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
            <Surface style={styles.card} elevation={0}>
                <View style={[styles.statusPill, { backgroundColor: config.bg, alignSelf: 'flex-start' }]}>
                    {config.dot && <View style={[styles.statusDot, { backgroundColor: config.color }]} />}
                    <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                </View>

                {printRequest.status === 'completed' && (
                    <View style={styles.pickupBox}>
                        <Feather name="package" size={16} color="#115E59" />
                        <Text style={styles.pickupText}>Sua impressão está pronta! Passe no Locomotiva Hub para retirá-la.</Text>
                    </View>
                )}

                {showReason && (
                    <View style={styles.reasonBox}>
                        <Feather name="info" size={16} color="#DC2626" />
                        <View style={styles.reasonContent}>
                            <Text style={styles.reasonTitle}>Motivo:</Text>
                            <Text style={styles.reasonText}>{printRequest.rejectionCancelReason}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Arquivos</Text>
                <View style={styles.infoRow}><Feather name="box" size={16} color="#6B7280" /><Text style={styles.infoText} numberOfLines={1}>Modelo 3D: {printRequest.stlFile.name}</Text></View>
                <View style={styles.infoRow}><Feather name="file" size={16} color="#6B7280" /><Text style={styles.infoText} numberOfLines={1}>Fatiado: {printRequest.gcodeFile.name}</Text></View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Detalhes do pedido</Text>
                <View style={styles.infoRow}><Feather name="layers" size={16} color="#6B7280" /><Text style={styles.infoText}>Material: {printRequest.filament.name.toUpperCase()}</Text></View>
                <View style={styles.infoRow}><Feather name="file-text" size={16} color="#6B7280" /><Text style={styles.infoText}>{printRequest.purpose}</Text></View>
            </Surface>

            <Portal>
                <Dialog visible={isCancelDialogVisible} onDismiss={() => setIsCancelDialogVisible(false)}>
                    <Dialog.Title>Cancelar pedido</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">Tem certeza que deseja cancelar este pedido de impressão?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setIsCancelDialogVisible(false)}>Voltar</Button>
                        <Button onPress={confirmCancel} textColor="#DC2626">Sim, cancelar</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    scroll: { padding: 20 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E5E7EB' },
    statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, marginBottom: 16 },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 12, fontWeight: '600' },
    pickupBox: { flexDirection: 'row', backgroundColor: '#CCFBF1', padding: 12, borderRadius: 8, marginBottom: 4, alignItems: 'center', gap: 8 },
    pickupText: { fontSize: 13, color: '#115E59', flex: 1, lineHeight: 18 },
    reasonBox: { flexDirection: 'row', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, marginTop: 4, alignItems: 'flex-start' },
    reasonContent: { marginLeft: 8, flex: 1 },
    reasonTitle: { fontSize: 13, fontWeight: '600', color: '#991B1B', marginBottom: 2 },
    reasonText: { fontSize: 13, color: '#B91C1C', lineHeight: 18 },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
    infoText: { fontSize: 15, color: '#374151', flex: 1 },
});
