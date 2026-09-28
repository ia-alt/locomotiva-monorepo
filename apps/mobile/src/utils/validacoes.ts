/**
 * Regras de validação dos formulários. Os campos têm máscara, então a
 * contagem é sempre feita nos dígitos: "123.456.789" tem 11 caracteres, mas
 * só 9 dígitos de CPF.
 */

export const soDigitos = (texto: string) => texto.replace(/\D/g, '');

/** CPF com os 11 dígitos. */
export function cpfCompleto(cpf: string): boolean {
    return soDigitos(cpf).length === 11;
}

/** Telefone com DDD: 10 dígitos (fixo) ou 11 (celular). */
export function telefoneCompleto(telefone: string): boolean {
    const quantidade = soDigitos(telefone).length;
    return quantidade === 10 || quantidade === 11;
}

/** Data DD/MM/AAAA que existe no calendário, de 1900 até hoje. */
export function dataDeNascimentoValida(texto: string): boolean {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) return false;
    const [dia, mes, ano] = texto.split('/').map(Number);
    const data = new Date(ano, mes - 1, dia);
    const existe = data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
    return existe && ano >= 1900 && data.getTime() <= Date.now();
}

/** Máscara DD/MM/AAAA enquanto a pessoa digita. */
export function mascaraDeData(texto: string): string {
    const digitos = soDigitos(texto).slice(0, 8);
    if (digitos.length <= 2) return digitos;
    if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
    return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

/** DD/MM/AAAA (tela) → AAAA-MM-DD (API). */
export function dataParaApi(texto: string): string {
    const [dia, mes, ano] = texto.split('/');
    return `${ano}-${mes}-${dia}`;
}

/** Data da API (AAAA-MM-DD ou ISO) → DD/MM/AAAA. Vazio quando não há data. */
export function dataParaExibir(valor: string | Date | null | undefined): string {
    if (!valor) return '';
    const data = new Date(valor);
    if (isNaN(data.getTime())) return '';
    const [ano, mes, dia] = data.toISOString().split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
}

export const MENSAGENS = {
    cpf: 'Digite os 11 dígitos do CPF.',
    telefone: 'Digite um telefone válido, com DDD.',
    dataDeNascimento: 'Digite uma data válida (DD/MM/AAAA).',
    dataDeNascimentoObrigatoria: 'Informe a data de nascimento.',
} as const;
