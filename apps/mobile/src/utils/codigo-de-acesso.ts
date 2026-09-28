/**
 * O QR code da recepção pode trazer só o código ou um link com `?code=...`.
 * Devolve o código nos dois casos.
 */
export function extrairCodigoDeAcesso(lido: string): string {
    const inicioDaQuery = lido.indexOf('?');
    if (inicioDaQuery === -1) return lido;
    const parametros = new URLSearchParams(lido.slice(inicioDaQuery + 1));
    return parametros.get('code') ?? lido;
}
