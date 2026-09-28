import React, { useState } from 'react';
import { usePrivateStackNavigation, usePrivateStackRoute } from '../../../navigation/PrivateNavigator';
import { EtapaDaReserva } from '../../../components/reservas/EtapaDaReserva';
import { SeletorDePessoas } from '../../../components/reservas/SeletorDePessoas';
import { Botao, Campo, Texto, cores } from '../../../ui';

const TITLE_MIN = 3;
const TITLE_MAX = 50;
const DESC_MIN = 10;
const DESC_MAX = 200;

export default function DetalhesReservaScreen() {
    const navigation = usePrivateStackNavigation();
    const route = usePrivateStackRoute<"DetalhesReserva">();
    const { room, day, startTime, endTime } = route.params;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [numberOfPeople, setNumberOfPeople] = useState(0);


    const titleLen = title.length;
    const descLen = description.length;
    const titleBelowMin = titleLen > 0 && titleLen < TITLE_MIN;
    const descBelowMin = descLen > 0 && descLen < DESC_MIN;

    const isFormValid =
        titleLen >= TITLE_MIN &&
        descLen >= DESC_MIN &&
        numberOfPeople >= 1;

    const handleConfirm = () => {
        navigation.navigate('ConfirmarReserva', {
            room,
            day,
            startTime,
            endTime,
            title,
            description,
            numberOfPeople,
        });
    };

    return (
        <EtapaDaReserva
            etapa={2}
            comCampos
            acao={<Botao titulo="Avançar" icone="seguir" iconeNoFim tamanho="alto" desabilitado={!isFormValid} onPress={handleConfirm} />}
        >
            <Texto variante="explicacao" cor={cores.textoSecundario}>
                Para finalizar, informe os detalhes da atividade que ocorrerá neste horário.
            </Texto>

            <Campo
                rotulo="Título da ação"
                placeholder="Ex: Reunião de Alinhamento"
                value={title}
                onChangeText={(t) => setTitle(t.slice(0, TITLE_MAX))}
                maxLength={TITLE_MAX}
                maximo={TITLE_MAX}
                erro={titleBelowMin ? 'Escreva um pouco mais' : undefined}
            />

            <Campo
                rotulo="Breve descrição"
                placeholder="Ex: Discutir metas do trimestre com a equipe de marketing."
                value={description}
                onChangeText={(t) => setDescription(t.slice(0, DESC_MAX))}
                maxLength={DESC_MAX}
                maximo={DESC_MAX}
                erro={descBelowMin ? 'Escreva um pouco mais' : undefined}
                multiline
                numberOfLines={4}
            />

            <SeletorDePessoas
                valor={numberOfPeople}
                maximo={room.capacity}
                aoDiminuir={() => setNumberOfPeople((n) => Math.max(0, n - 1))}
                aoAumentar={() => setNumberOfPeople((n) => Math.min(room.capacity, n + 1))}
                aoDigitar={(t) => {
                    const n = parseInt(t.replace(/\D/g, ''), 10);
                    if (isNaN(n) || t === '') {
                        setNumberOfPeople(0);
                    } else {
                        setNumberOfPeople(Math.min(n, room.capacity));
                    }
                }}
            />
        </EtapaDaReserva>
    );
}
