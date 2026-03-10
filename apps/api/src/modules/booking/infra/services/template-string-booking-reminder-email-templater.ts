import { BookingReminderEmailTemplater } from "@booking/application/services";
import { format } from "date-fns";

export class TemplateStringBookingReminderEmailTemplater implements BookingReminderEmailTemplater {
    template(params: BookingReminderEmailTemplater.Params): Promise<string> {

        const day = format(params.booking.period.value.from, 'dd/MM/yyyy');
        const hourFrom = format(params.booking.period.value.from, 'HH:mm');
        const hourTo = format(params.booking.period.value.to, 'HH:mm');
        return Promise.resolve(`<h1>Lembrete de reserva</h1>
        <p>Olá ${params.user.firstName},</p>
        <p>Lembrete de reserva para a sala ${params.room.name} no dia ${day} das ${hourFrom} às ${hourTo}</p>
        <p>Atenciosamente,</p>
        <p>Equipe Locomotiva</p>
        `);
    }
}