import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { fonteImagemSala } from '../../constants/imagens';
import { ALVO_DE_TOQUE, Icone, Texto, cores, espaco, raio } from '../../ui';
import { FotoEmTelaCheia } from './FotoEmTelaCheia';

type Props = {
    nome: string;
    /** Sem capacidade, a linha não aparece. */
    capacidade?: number;
    descricao?: string | null;
    photoUrl?: string | null;
    /** Com `aoEscolher`, o cartão inteiro vira uma opção (lista de salas da reserva). */
    aoEscolher?: () => void;
    escolhida?: boolean;
    /** Informação extra no pé do cartão, depois de um fio (o horário de funcionamento). */
    children?: React.ReactNode;
};

const ALTURA_DA_FOTO = 136;
const SELO = 32;
const MARCADOR = 24;

/**
 * Sala com a foto em cima, nome, capacidade e descrição. A foto abre em tela
 * cheia. Na escolha da sala, a escolhida ganha a borda azul e o check.
 */
export function CartaoDaSala({ nome, capacidade, descricao, photoUrl, aoEscolher, escolhida = false, children }: Props) {
    const [fotoAberta, setFotoAberta] = useState(false);
    const foto = fonteImagemSala(photoUrl);
    const textoDaCapacidade = capacidade !== undefined ? `Capacidade: ${capacidade} pessoas` : null;
    const verFoto = `Ver a foto de ${nome} em tela cheia`;

    const imagem = <Image source={foto} style={estilos.foto} resizeMode="cover" />;
    const selo = (
        <View style={estilos.selo}>
            <Icone nome="ampliar" cor={cores.papel} tamanho={16} />
        </View>
    );
    const textos = (
        <View style={estilos.textos}>
            <View style={estilos.linhaDoNome}>
                <Texto variante="destaque" style={estilos.nome}>{nome}</Texto>
                {aoEscolher ? <Marcador marcado={escolhida} /> : null}
            </View>
            {textoDaCapacidade ? (
                <View style={estilos.capacidade}>
                    <Icone nome="pessoas" cor={cores.textoSecundario} tamanho={16} />
                    <Texto variante="apoio" cor={cores.textoSecundario}>{textoDaCapacidade}</Texto>
                </View>
            ) : null}
            {descricao ? <Texto variante="apoio" cor={cores.textoSecundario}>{descricao}</Texto> : null}
            {children ? <View style={estilos.extra}>{children}</View> : null}
        </View>
    );

    return (
        <View style={estilos.cartao}>
            {aoEscolher ? (
                <>
                    <Pressable
                        onPress={aoEscolher}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: escolhida }}
                        accessibilityLabel={[nome, textoDaCapacidade, descricao].filter(Boolean).join('. ')}
                        style={({ pressed }) => pressed && estilos.pressionado}
                    >
                        {imagem}
                        {textos}
                    </Pressable>
                    {/* Fora do Pressable da escolha: tocar na foto escolhe a sala,
                        e só o selo abre a foto. */}
                    <Pressable
                        onPress={() => setFotoAberta(true)}
                        accessibilityRole="button"
                        accessibilityLabel={verFoto}
                        hitSlop={(ALVO_DE_TOQUE - SELO) / 2}
                        style={estilos.botaoDoSelo}
                    >
                        {selo}
                    </Pressable>
                </>
            ) : (
                <>
                    <Pressable
                        onPress={() => setFotoAberta(true)}
                        accessibilityRole="imagebutton"
                        accessibilityLabel={verFoto}
                        style={({ pressed }) => pressed && estilos.pressionado}
                    >
                        {imagem}
                        <View style={estilos.botaoDoSelo}>{selo}</View>
                    </Pressable>
                    {textos}
                </>
            )}
            {escolhida ? <View style={estilos.bordaDaEscolhida} /> : null}
            <FotoEmTelaCheia
                foto={fotoAberta ? foto : null}
                aoFechar={() => setFotoAberta(false)}
                descricao={`Foto de ${nome}`}
            />
        </View>
    );
}

/** Bolinha de escolha: vazada, ou azul com check na sala escolhida. */
function Marcador({ marcado }: { marcado: boolean }) {
    return (
        <View style={[estilos.marcador, marcado && estilos.marcadorMarcado]}>
            {marcado ? <Icone nome="check" cor={cores.papel} tamanho={14} /> : null}
        </View>
    );
}

const estilos = StyleSheet.create({
    cartao: {
        borderRadius: raio.cartao,
        backgroundColor: cores.papel,
        overflow: 'hidden',
    },
    pressionado: { opacity: 0.85 },
    foto: { width: '100%', height: ALTURA_DA_FOTO, backgroundColor: cores.linhaSobrePapel },
    botaoDoSelo: { position: 'absolute', top: espaco.s, right: espaco.s },
    selo: {
        width: SELO,
        height: SELO,
        borderRadius: SELO / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: cores.veu,
    },
    textos: { gap: espaco.xs, padding: espaco.l },
    linhaDoNome: { flexDirection: 'row', alignItems: 'flex-start', gap: espaco.m },
    nome: { flex: 1 },
    capacidade: { flexDirection: 'row', alignItems: 'center', gap: espaco.s },
    extra: {
        marginTop: espaco.s,
        paddingTop: espaco.m,
        borderTopWidth: 1,
        borderTopColor: cores.linhaSobrePapel,
    },
    marcador: {
        width: MARCADOR,
        height: MARCADOR,
        borderRadius: MARCADOR / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: cores.linha,
    },
    marcadorMarcado: { borderColor: cores.azul, backgroundColor: cores.azul },
    bordaDaEscolhida: {
        ...StyleSheet.absoluteFillObject,
        pointerEvents: 'none',
        borderRadius: raio.cartao,
        borderWidth: 2,
        borderColor: cores.azul,
    },
});
