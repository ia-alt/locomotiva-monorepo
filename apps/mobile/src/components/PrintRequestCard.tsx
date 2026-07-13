import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useORPC } from '../locomotiva-api/context';
import { ORPCOutputs } from '../locomotiva-api/types';

type PrintRequest = ORPCOutputs["printing"]["findMyPrintRequests"]["items"][0];

interface PrintRequestCardProps {
    printRequest: PrintRequest;
    onPressDetails: () => void;
}

// Labels na visão do USUÁRIO: aprovado e em produção aparecem como "Aguardando produção".
export const USER_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: boolean }> = {
    pending: { label: 'Em análise', color: '#D97706', bg: '#FEF3C7', dot: true },
    approved: { label: 'Aguardando produção', color: '#1E40AF', bg: '#DBEAFE', dot: true },
    in_production: { label: 'Aguardando produção', color: '#1E40AF', bg: '#DBEAFE', dot: true },
    completed: { label: 'Pronto para retirada', color: '#115E59', bg: '#CCFBF1', dot: true },
    delivered: { label: 'Entregue', color: '#166534', bg: '#DCFCE7', dot: false },
    discarded: { label: 'Descartado', color: '#374151', bg: '#F3F4F6', dot: false },
    rejected: { label: 'Recusado', color: '#DC2626', bg: '#FEE2E2', dot: true },
    cancelled: { label: 'Cancelado', color: '#a87373ff', bg: '#FEE2E2', dot: true },
};

export default function PrintRequestCard({ printRequest, onPressDetails }: PrintRequestCardProps) {
    const config = USER_STATUS_CONFIG[printRequest.status] || USER_STATUS_CONFIG.pending;

    // o pedido guarda só ids — o nome do material vem do catálogo (cacheado; 1 request pra lista toda)
    const orpc = useORPC();
    const { data: filaments } = useQuery(orpc.printing.listFilaments.queryOptions({ input: {} }));
    const materialName = filaments?.find((f) => f.id === printRequest.filamentId)?.name;

    return (
        <Surface style={styles.card} elevation={0}>
            <TouchableOpacity onPress={onPressDetails} activeOpacity={0.7}>
                <View style={styles.header}>
                    <View style={styles.iconBox}>
                        <Feather name="box" size={24} color="#1E88E5" />
                    </View>

                    <View style={styles.info}>
                        <Text style={styles.fileName} numberOfLines={1}>{printRequest.purpose}</Text>
                        {materialName ? (
                            <View style={styles.metaRow}>
                                <Feather name="layers" size={12} color="#6B7280" />
                                <Text style={styles.metaText}>{materialName.toUpperCase()}</Text>
                            </View>
                        ) : null}
                    </View>

                    <Feather name="chevron-right" size={20} color="#9CA3AF" />
                </View>

                <View style={styles.divider} />

                <View style={styles.footer}>
                    <View style={[styles.statusPill, { backgroundColor: config.bg }]}>
                        {config.dot && <View style={[styles.statusDot, { backgroundColor: config.color }]} />}
                        <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Surface>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6' },
    header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
    iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    info: { flex: 1, justifyContent: 'center' },
    fileName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 4 },
    metaText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
    purpose: { fontSize: 13, color: '#4B5563' },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: -16, marginBottom: 16 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 12, fontWeight: '600' },
});
