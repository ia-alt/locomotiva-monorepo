/**
 * Informações institucionais do espaço, exibidas no app.
 *
 * A descrição de cada sala NÃO fica aqui: é cadastrada pelo admin
 * (Gerenciar Salas → "Descrição da Sala") e chega junto com a sala pela API.
 */
export const HORARIO_FUNCIONAMENTO = {
    titulo: 'Horário de funcionamento',
    dias: 'Segunda a sexta-feira',
    horas: '08h00 às 17h00',
} as const;

/**
 * O mesmo horário em números, para o app saber se o hub está aberto agora.
 * Dias no padrão do `Date.getDay()` (0 = domingo). Mantenha igual ao texto acima.
 */
export const EXPEDIENTE = {
    diasDaSemana: [1, 2, 3, 4, 5],
    abre: { hora: 8, minuto: 0 },
    fecha: { hora: 17, minuto: 0 },
} as const;
