import { useEffect, useState } from 'react';

const doisDigitos = (n: number) => String(n).padStart(2, '0');

/** Tempo desde `inicio`, no formato "HH:MM:SS", atualizado a cada segundo. `null` sem início. */
export function useCronometro(inicio: Date | null): string | null {
    const [agora, setAgora] = useState(() => Date.now());

    useEffect(() => {
        if (!inicio) return;
        setAgora(Date.now());
        const intervalo = setInterval(() => setAgora(Date.now()), 1000);
        return () => clearInterval(intervalo);
    }, [inicio]);

    if (!inicio) return null;
    const total = Math.max(0, Math.floor((agora - inicio.getTime()) / 1000));
    const horas = Math.floor(total / 3600);
    const minutos = Math.floor((total % 3600) / 60);
    const segundos = total % 60;
    return `${doisDigitos(horas)}:${doisDigitos(minutos)}:${doisDigitos(segundos)}`;
}

/** "14:02" a partir de uma data. */
export function horaEMinuto(data: Date): string {
    return `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
}
