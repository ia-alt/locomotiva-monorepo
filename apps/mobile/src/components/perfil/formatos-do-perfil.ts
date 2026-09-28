/** Até duas iniciais do nome ("Maria Souza" → "MS"). */
export function iniciais(nome: string | undefined): string {
    if (!nome) return '?';
    return nome
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('');
}

/** "12345678901" → "123.456.789-01" */
export function cpfFormatado(cpf: string | undefined): string {
    if (!cpf) return '-';
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return cpf;
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function dataFormatada(date: string | Date | undefined): string {
    if (!date) return '-';
    if (typeof date === 'string') {
        const [year, month, day] = date.split('T')[0].split('-').map(Number);
        if (!year || !month || !day) return '-';
        return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-BR');
}
