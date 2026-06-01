const MONTHS_LONG = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MONTHS_SHORT = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
const WEEKDAYS_LONG = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

function parseOnlyDate(onlyDateStr: string): { year: number; month: number; day: number } {
    const [year, month, day] = onlyDateStr.split('-').map(Number);
    return { year, month, day };
}

// Dia da semana (0=domingo) sem usar Date — algoritmo de Sakamoto.
function weekdayIndex(year: number, month: number, day: number): number {
    const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
    const y = month < 3 ? year - 1 : year;
    return (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + t[month - 1] + day) % 7;
}

export function onlyDateStrToBrDate(onlyDateStr: string): string {
    return onlyDateStr.split('-').reverse().join('/');
}

// "2026-05-26" -> "26 de mai. de 2026"
export function onlyDateStrToShortBrDate(onlyDateStr: string): string {
    const { year, month, day } = parseOnlyDate(onlyDateStr);
    return `${day.toString().padStart(2, '0')} de ${MONTHS_SHORT[month - 1]} de ${year}`;
}

// "2026-05-26" -> "terça-feira, 26 de maio de 2026"
export function onlyDateStrToLongBrDate(onlyDateStr: string): string {
    const { year, month, day } = parseOnlyDate(onlyDateStr);
    const weekday = WEEKDAYS_LONG[weekdayIndex(year, month, day)];
    return `${weekday}, ${day} de ${MONTHS_LONG[month - 1]} de ${year}`;
}

export function onlyTimeObjToTimeStr(
    onlyTime: { hour: number; minute: number; second: number },
    params?: { showSeconds?: boolean },
): string {
    return `${onlyTime.hour.toString().padStart(2, '0')}:${onlyTime.minute.toString().padStart(2, '0')}`
        + (params?.showSeconds ? `:${onlyTime.second.toString().padStart(2, '0')}` : '');
}
