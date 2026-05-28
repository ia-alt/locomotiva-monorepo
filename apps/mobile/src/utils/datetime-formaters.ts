export function onlyDateStrToBrDate(onlyDateStr: string): string {
    return onlyDateStr.split('-').reverse().join('/')
}

export function onlyTimeObjToTimeStr(onlyTime: { hour: number, minute: number, second: number }, params?: { showSeconds?: boolean }): string {
    return `${onlyTime.hour.toString().padStart(2, '0')}:${onlyTime.minute.toString().padStart(2, '0')}` + (params?.showSeconds ? `:${onlyTime.second.toString().padStart(2, '0')}` : '');
}