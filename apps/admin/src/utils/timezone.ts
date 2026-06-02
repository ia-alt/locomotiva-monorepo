
export const COMPANY_TZ = 'America/Fortaleza';

export function getTimePartsInTZ(iso: string | Date): { hour: number; minute: number } {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: COMPANY_TZ,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(new Date(iso)).map((p) => [p.type, p.value]),
  ) as Record<string, string>;
  return { hour: Number(parts.hour) % 24, minute: Number(parts.minute) };
}

export function toTimeStringInTZ(iso: string | Date): string {
  const { hour, minute } = getTimePartsInTZ(iso);
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}
