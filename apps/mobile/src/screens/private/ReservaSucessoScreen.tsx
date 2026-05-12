import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrivateStackParamList } from '../../navigation/PrivateNavigator';
import { Feather } from '@expo/vector-icons';

type ReservaSucessoNavigationProp = NativeStackNavigationProp<PrivateStackParamList, 'ReservaSucesso'>;

export default function ReservaSucessoScreen() {
    const navigation = useNavigation<ReservaSucessoNavigationProp>();

    const handleGoToReservations = () => {
        // Reset navigation to the main drawer and specific tab if possible
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: 'Drawer',
                    state: {
                        routes: [
                            {
                                name: 'Menu principal',
                                state: {
                                    routes: [{ name: 'Reservas' }]
                                }
                            }
                        ]
                    }
                } as any
            ],
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Feather name="check-circle" size={80} color="#10B981" />
                <Text style={styles.title}>Solicitação Recebida com Sucesso!</Text>
                <Text style={styles.subtitle}>
                    Enviamos sua solicitação para nossa equipe. Você receberá uma confirmação em breve. Enquanto isso, acompanhe o status em 'Minhas Reservas'.
                </Text>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={handleGoToReservations}
                activeOpacity={0.7}
            >
                <Text style={styles.buttonText}>Ir para minhas reservas</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 24,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 24,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 16,
    },
    button: {
        backgroundColor: '#1E88E5',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    }
});
