import { useEffect, useRef } from 'react';
import { useCheckin } from '../contexts/checkin-context';

/**
 * Check-in automático quando o app abre pelo link do QR code
 * (`.../checkin?code=...`). Cada código é usado uma vez só; no fim avisa a
 * tela, que limpa o parâmetro da rota. Precisa estar dentro do CheckinProvider.
 */
export function useCheckinPorCodigo(codigo: string | undefined, aoConcluir: () => void) {
    const { isCheckedIn, isLoading, checkIn } = useCheckin();
    const ultimoCodigoUsado = useRef<string | null>(null);

    useEffect(() => {
        if (!codigo || isCheckedIn || isLoading || ultimoCodigoUsado.current === codigo) return;
        ultimoCodigoUsado.current = codigo;
        // O erro (código inválido, fora do horário...) já vira aviso pelo
        // MutationCache global em App.tsx; aqui só não deixa a promessa solta.
        checkIn(codigo)
            .catch(() => undefined)
            .finally(aoConcluir);
    }, [codigo, isCheckedIn, isLoading, checkIn, aoConcluir]);
}
