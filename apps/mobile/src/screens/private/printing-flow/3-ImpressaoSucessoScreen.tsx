import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrivateStackParamList } from '../../../navigation/PrivateNavigator';
import { TelaDeConclusao } from '../../../ui';

type Nav = NativeStackNavigationProp<PrivateStackParamList, 'ImpressaoSucesso'>;

export default function ImpressaoSucessoScreen() {
    const navigation = useNavigation<Nav>();

    const handleGoToList = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Abas', params: { screen: 'Impressões' } }],
        });
    };

    return (
        <TelaDeConclusao
            titulo="Pedido enviado com sucesso!"
            texto={'Seu pedido de impressão está em análise. Você receberá um e-mail com o resultado e pode acompanhar o status na aba "Impressões".'}
            rotuloDoBotao="Ir para minhas impressões"
            aoContinuar={handleGoToList}
        />
    );
}
