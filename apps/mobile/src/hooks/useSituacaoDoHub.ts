import { useEffect, useState } from 'react';
import { EXPEDIENTE } from '../constants/espaco';

export type SituacaoDoHub = {
    aberto: boolean;
    /** "Aberto" ou "Fechado". */
    rotulo: string;
    /** "até 17:00", "abre 08:00", "abre amanhã", "abre segunda". */
    detalhe: string;
};

const NOMES_DOS_DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const hhmm = ({ hora, minuto }: { hora: number; minuto: number }) =>
    `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;

const ehDiaUtil = (dia: number) => (EXPEDIENTE.diasDaSemana as readonly number[]).includes(dia);

/** Calcula pelo relógio do aparelho. Feriados não entram (não há essa informação no app). */
export function situacaoDoHub(agora: Date): SituacaoDoHub {
    const dia = agora.getDay();
    const minutos = agora.getHours() * 60 + agora.getMinutes();
    const abre = EXPEDIENTE.abre.hora * 60 + EXPEDIENTE.abre.minuto;
    const fecha = EXPEDIENTE.fecha.hora * 60 + EXPEDIENTE.fecha.minuto;

    if (ehDiaUtil(dia) && minutos >= abre && minutos < fecha) {
        return { aberto: true, rotulo: 'Aberto', detalhe: `até ${hhmm(EXPEDIENTE.fecha)}` };
    }
    if (ehDiaUtil(dia) && minutos < abre) {
        return { aberto: false, rotulo: 'Fechado', detalhe: `abre ${hhmm(EXPEDIENTE.abre)}` };
    }

    let diasAteAbrir = 1;
    while (!ehDiaUtil((dia + diasAteAbrir) % 7) && diasAteAbrir < 7) diasAteAbrir++;
    const detalhe = diasAteAbrir === 1 ? 'abre amanhã' : `abre ${NOMES_DOS_DIAS[(dia + diasAteAbrir) % 7]}`;
    return { aberto: false, rotulo: 'Fechado', detalhe };
}

/** Situação do hub agora, reavaliada a cada minuto. */
export function useSituacaoDoHub(): SituacaoDoHub {
    const [situacao, setSituacao] = useState(() => situacaoDoHub(new Date()));
    useEffect(() => {
        const intervalo = setInterval(() => setSituacao(situacaoDoHub(new Date())), 60_000);
        return () => clearInterval(intervalo);
    }, []);
    return situacao;
}
