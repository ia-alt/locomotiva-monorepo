import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { addDays, startOfDay } from 'date-fns';
import { useORPC } from '../locomotiva-api/context';
import { ORPCInputs, ORPCOutputs } from '../locomotiva-api/types';

export type Reserva = ORPCOutputs['booking']['findMyBookings']['items'][number];
type FiltroDeReservas = NonNullable<ORPCInputs['booking']['findMyBookings']['filter']>;
type StatusDaReserva = NonNullable<FiltroDeReservas['status']>[number];

export type AbaDeReservas = 'proximas' | 'anteriores';

const inicioDaReserva = (reserva: Reserva) => new Date(reserva.period.from).getTime();
const maisCedoPrimeiro = (a: Reserva, b: Reserva) => inicioDaReserva(a) - inicioDaReserva(b);

/** A API filtra por horário de início e devolve do mais tarde para o mais cedo. */
function periodoDaAba(aba: AbaDeReservas) {
    const hoje = startOfDay(new Date());
    return aba === 'proximas'
        ? { from: hoje.toISOString(), to: addDays(hoje, 730).toISOString() }
        : { from: new Date(2020, 0, 1).toISOString(), to: hoje.toISOString() };
}

/**
 * Reservas da pessoa, separadas em próximas (de hoje em diante, da mais cedo
 * para a mais tarde) e anteriores (da mais recente para a mais antiga).
 *
 * Próximas vêm numa página só, grande: a API ordena ao contrário do que a
 * tela mostra, e reordenar página a página embaralharia a lista.
 * Anteriores paginam normalmente, ao rolar.
 */
export function useMinhasReservas(aba: AbaDeReservas) {
    const orpc = useORPC();
    const periodo = useMemo(() => periodoDaAba(aba), [aba]);
    const tamanhoDaPagina = aba === 'proximas' ? 50 : 10;

    const consulta = useInfiniteQuery(
        orpc.booking.findMyBookings.infiniteOptions({
            input: (pagina: number) => ({
                pagination: { pageNumber: pagina, pageSize: tamanhoDaPagina },
                filter: { period: periodo },
            }),
            initialPageParam: 1,
            getNextPageParam: (ultima) =>
                aba === 'anteriores' && ultima.currentPage < ultima.pagesCount ? ultima.currentPage + 1 : undefined,
        }),
    );

    const reservas = useMemo(() => {
        const todas = consulta.data?.pages.flatMap((pagina) => pagina.items) ?? [];
        return aba === 'proximas' ? [...todas].sort(maisCedoPrimeiro) : todas;
    }, [consulta.data, aba]);

    return { ...consulta, reservas };
}

const STATUS_ATIVOS = ['pending', 'confirmed'] as StatusDaReserva[];

/** A próxima reserva ativa (aguardando ou confirmada) que ainda não terminou. */
export function useProximaReserva() {
    const orpc = useORPC();
    // Fixado na montagem: um `new Date()` a cada render mudaria a chave da consulta.
    const entrada = useMemo(() => {
        const hoje = startOfDay(new Date());
        return {
            pagination: { pageNumber: 1, pageSize: 50 },
            filter: {
                period: { from: hoje.toISOString(), to: addDays(hoje, 365).toISOString() },
                status: STATUS_ATIVOS,
            },
        };
    }, []);

    const consulta = useQuery(orpc.booking.findMyBookings.queryOptions({ input: entrada }));

    const proxima = useMemo(() => {
        const agora = Date.now();
        const futuras = (consulta.data?.items ?? []).filter((r) => new Date(r.period.to).getTime() > agora);
        return futuras.sort(maisCedoPrimeiro)[0] ?? null;
    }, [consulta.data]);

    return { proxima, carregando: consulta.isLoading, recarregar: consulta.refetch };
}
