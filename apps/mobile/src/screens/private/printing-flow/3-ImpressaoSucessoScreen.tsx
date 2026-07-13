import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrivateStackParamList } from '../../../navigation/PrivateNavigator';
import { Feather } from '@expo/vector-icons';

type Nav = NativeStackNavigationProp<PrivateStackParamList, 'ImpressaoSucesso'>;

export default function ImpressaoSucessoScreen() {
    const navigation = useNavigation<Nav>();

    const handleGoToList = () => {
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: 'Drawer',
                    state: { routes: [{ name: 'Impressões 3D' }] },
                } as any,
            ],
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Feather name="check-circle" size={80} color="#10B981" />
                <Text style={styles.title}>Pedido enviado com sucesso!</Text>
                <Text style={styles.subtitle}>
                    Seu pedido de impressão está em análise. Você receberá um e-mail com o resultado e pode acompanhar o status na aba "Impressões 3D".
                </Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleGoToList} activeOpacity={0.7}>
                <Text style={styles.buttonText}>Ir para minhas impressões</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF', padding: 24, justifyContent: 'space-between' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginTop: 24, marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24, paddingHorizontal: 16 },
    button: { backgroundColor: '#1E88E5', borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    buttonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
});
