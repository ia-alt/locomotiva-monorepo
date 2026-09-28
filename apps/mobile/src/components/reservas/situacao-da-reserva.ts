import type { AspectoDoSinal } from '../../ui';
import type { Reserva } from '../../hooks/useReservas';

type Situacao = { rotulo: string; sinal: AspectoDoSinal };

/**
 * Como cada status da reserva aparece para quem reservou. O sinal segue a
 * lógica da ferrovia: verde = pode seguir, amarelo = atenção (ainda depende
 * de aprovação), vermelho = não vai acontecer; apagado = já passou.
 */
const SITUACOES: Record<string, Situacao> = {
    pending: { rotulo: 'Aguardando aprovação', sinal: 'amarelo' },
    confirmed: { rotulo: 'Confirmada', sinal: 'verde' },
    attended: { rotulo: 'Concluída', sinal: 'apagado' },
    cancelled: { rotulo: 'Cancelada', sinal: 'vermelho' },
    rejected: { rotulo: 'Rejeitada', sinal: 'vermelho' },
    no_show: { rotulo: 'Não compareceu', sinal: 'apagado' },
};

export function situacaoDaReserva(status: Reserva['status']): Situacao {
    return SITUACOES[status] ?? SITUACOES.pending;
}

/** Ainda vai acontecer e não foi rejeitada nem cancelada. */
export function reservaEstaDePe(reserva: Reserva): boolean {
    const ativa = reserva.status === 'pending' || reserva.status === 'confirmed';
    return ativa && new Date(reserva.period.to).getTime() > Date.now();
}
