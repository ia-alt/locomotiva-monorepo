export function maskCpf(text: string): string {
    const d = text.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 3) return d
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

export function maskBirthDate(text: string): string {
    const d = text.replace(/\D/g, '').slice(0, 8)
    if (d.length <= 2) return d
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

export function toIsoDate(ddmmyyyy: string): string {
    const [dd, mm, yyyy] = ddmmyyyy.split('/')
    return `${yyyy}-${(mm ?? '').padStart(2, '0')}-${(dd ?? '').padStart(2, '0')}`
}
