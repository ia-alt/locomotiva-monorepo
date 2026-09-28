import React from 'react';
import { Trajeto } from '../../ui';

const PARADAS = ['CPF', 'Código', 'Nova senha'] as const;

/** Etapas do "Esqueci minha senha": pedir o código, conferir o código e trocar a senha. */
export function TrajetoDaRecuperacao({ atual }: { atual: 0 | 1 | 2 }) {
    return <Trajeto paradas={PARADAS} atual={atual} />;
}
