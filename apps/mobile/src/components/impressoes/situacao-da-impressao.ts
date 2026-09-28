import type { AspectoDoSinal } from '../../ui';
import type { ORPCOutputs } from '../../locomotiva-api/types';

export type PedidoDeImpressao = ORPCOutputs['printing']['findMyPrintRequests']['items'][number];
type StatusDoPedido = PedidoDeImpressao['status'];

type Situacao = { rotulo: string; sinal: AspectoDoSinal };

/**
 * Como cada status do pedido aparece para quem pediu. Aprovado e em produção
 * aparecem juntos como "Aguardando produção". O sinal segue a lógica das
 * reservas: amarelo = ainda está com a equipe, verde = pode buscar,
 * vermelho = não vai ser impresso, apagado = encerrado.
 */
const SITUACOES: Record<StatusDoPedido, Situacao> = {
    pending: { rotulo: 'Em análise', sinal: 'amarelo' },
    approved: { rotulo: 'Aguardando produção', sinal: 'amarelo' },
    in_production: { rotulo: 'Aguardando produção', sinal: 'amarelo' },
    completed: { rotulo: 'Pronto para retirada', sinal: 'verde' },
    delivered: { rotulo: 'Entregue', sinal: 'apagado' },
    discarded: { rotulo: 'Descartado', sinal: 'apagado' },
    rejected: { rotulo: 'Recusado', sinal: 'vermelho' },
    cancelled: { rotulo: 'Cancelado', sinal: 'vermelho' },
};

export function situacaoDaImpressao(status: StatusDoPedido): Situacao {
    return SITUACOES[status] ?? SITUACOES.pending;
}

/** Fases que o pedido percorre até a entrega, no `Trajeto` do detalhe. */
export const FASES_DO_PEDIDO = ['Análise', 'Produção', 'Pronto', 'Entregue'] as const;

const FASE_DE_CADA_STATUS: Partial<Record<StatusDoPedido, number>> = {
    pending: 0,
    approved: 1,
    in_production: 1,
    completed: 2,
    delivered: 3,
};

/** Fase atual no trajeto, ou `null` quando o pedido saiu dele (recusado, cancelado ou descartado). */
export function faseDoPedido(status: StatusDoPedido): number | null {
    return FASE_DE_CADA_STATUS[status] ?? null;
}

type Encerramento = { tom: 'erro' | 'atencao'; texto: string };

const ENCERRAMENTOS: Partial<Record<StatusDoPedido, Encerramento>> = {
    rejected: { tom: 'erro', texto: 'Este pedido não será impresso.' },
    cancelled: { tom: 'erro', texto: 'Este pedido não será impresso.' },
    discarded: { tom: 'atencao', texto: 'A peça pronta não foi retirada e foi descartada.' },
};

/**
 * O recado que o detalhe mostra no lugar do trajeto quando o pedido saiu dele.
 * O texto só aparece quando a equipe não deixou motivo (o cancelamento feito
 * pela própria pessoa não tem).
 */
export function encerramentoDoPedido(status: StatusDoPedido): Encerramento | null {
    return ENCERRAMENTOS[status] ?? null;
}
