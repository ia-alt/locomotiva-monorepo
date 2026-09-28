import { format } from 'date-fns';
import { horaEMinuto } from '../../hooks/useCronometro';
import {
    onlyDateStrToLongBrDate,
    onlyDateStrToShortBrDate,
    onlyDateStrToTicketParts,
} from '../../utils/datetime-formaters';

/**
 * As datas do pedido chegam em ISO, em UTC. O dia sai do fuso do aparelho:
 * um pedido feito às 22h em São Luís já é o dia seguinte em UTC.
 */
function diaNoAparelho(iso: string): string | null {
    const data = new Date(iso);
    return Number.isNaN(data.getTime()) ? null : format(data, 'yyyy-MM-dd');
}

/** "24 SET" no ano corrente e "24 SET 2025" nos anteriores, no estilo do bilhete. */
export function dataCurtaDoPedido(iso: string): string | null {
    const dia = diaNoAparelho(iso);
    if (!dia) return null;
    const { dia: numero, mes } = onlyDateStrToTicketParts(dia);
    const ano = dia.slice(0, 4);
    return ano === String(new Date().getFullYear()) ? `${numero} ${mes}` : `${numero} ${mes} ${ano}`;
}

/** "24 de set. de 2026 às 13:45" */
export function dataEHoraDoPedido(iso: string): string | null {
    const dia = diaNoAparelho(iso);
    return dia ? `${onlyDateStrToShortBrDate(dia)} às ${horaEMinuto(new Date(iso))}` : null;
}

/** "quinta-feira, 24 de setembro de 2026", para o leitor de tela. */
export function dataPorExtensoDoPedido(iso: string): string | null {
    const dia = diaNoAparelho(iso);
    return dia ? onlyDateStrToLongBrDate(dia) : null;
}
