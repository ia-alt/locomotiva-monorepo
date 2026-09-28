import React from 'react';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { cores } from './tema';

type Definicao =
    | { conjunto: 'feather'; nome: React.ComponentProps<typeof Feather>['name'] }
    | { conjunto: 'mci'; nome: React.ComponentProps<typeof MaterialCommunityIcons>['name'] };

/**
 * Vocabulário de ícones do app. As telas pedem pelo significado ("reservas"),
 * e a troca de desenho acontece só aqui. Traço fino do Feather como base; o
 * bilhete e o QR code vêm do Material porque o Feather não tem esses desenhos.
 */
const ICONES = {
    inicio: { conjunto: 'feather', nome: 'home' },
    reservas: { conjunto: 'mci', nome: 'ticket-outline' },
    impressoes: { conjunto: 'feather', nome: 'box' },
    perfil: { conjunto: 'feather', nome: 'user' },
    qrcode: { conjunto: 'mci', nome: 'qrcode-scan' },
    sair: { conjunto: 'feather', nome: 'log-out' },
    mais: { conjunto: 'feather', nome: 'plus' },
    menos: { conjunto: 'feather', nome: 'minus' },
    avancar: { conjunto: 'feather', nome: 'chevron-right' },
    seguir: { conjunto: 'feather', nome: 'arrow-right' },
    voltar: { conjunto: 'feather', nome: 'arrow-left' },
    anterior: { conjunto: 'feather', nome: 'chevron-left' },
    escudo: { conjunto: 'feather', nome: 'shield' },
    pacote: { conjunto: 'feather', nome: 'package' },
    abrir: { conjunto: 'feather', nome: 'chevron-down' },
    fechar: { conjunto: 'feather', nome: 'x' },
    check: { conjunto: 'feather', nome: 'check' },
    sucesso: { conjunto: 'feather', nome: 'check-circle' },
    info: { conjunto: 'feather', nome: 'info' },
    alerta: { conjunto: 'feather', nome: 'alert-triangle' },
    olho: { conjunto: 'feather', nome: 'eye' },
    olhoFechado: { conjunto: 'feather', nome: 'eye-off' },
    calendario: { conjunto: 'feather', nome: 'calendar' },
    relogio: { conjunto: 'feather', nome: 'clock' },
    pessoas: { conjunto: 'feather', nome: 'users' },
    local: { conjunto: 'feather', nome: 'map-pin' },
    arquivo: { conjunto: 'feather', nome: 'file' },
    enviarArquivo: { conjunto: 'feather', nome: 'upload-cloud' },
    camadas: { conjunto: 'feather', nome: 'layers' },
    editar: { conjunto: 'feather', nome: 'edit-2' },
    cadeado: { conjunto: 'feather', nome: 'lock' },
    email: { conjunto: 'feather', nome: 'mail' },
    telefone: { conjunto: 'feather', nome: 'phone' },
    empresa: { conjunto: 'feather', nome: 'briefcase' },
    documento: { conjunto: 'feather', nome: 'credit-card' },
    lixeira: { conjunto: 'feather', nome: 'trash-2' },
    imagem: { conjunto: 'feather', nome: 'image' },
    ampliar: { conjunto: 'feather', nome: 'maximize-2' },
} satisfies Record<string, Definicao>;

export type NomeDoIcone = keyof typeof ICONES;

type Props = {
    nome: NomeDoIcone;
    cor?: string;
    tamanho?: number;
};

export function Icone({ nome, cor = cores.grafite, tamanho = 24 }: Props) {
    const definicao: Definicao = ICONES[nome];
    return definicao.conjunto === 'feather'
        ? <Feather name={definicao.nome} size={tamanho} color={cor} />
        : <MaterialCommunityIcons name={definicao.nome} size={tamanho} color={cor} />;
}
