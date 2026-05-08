import { BookingEmailTemplater } from '../../domain/services';
import { Booking } from '../../domain/entities';


const logoSrc = 'cid:logo@locomotiva';

type BookingEmailParams = {
  userName: string;
  roomName: string;
  day: string;
  hourFrom: string;
  hourTo: string;
  title: string;
  status: 'confirmed' | 'rejected' | 'cancelled' | 'no_show';
  reason?: string;
  numberOfPeople?: number;
};

const STATUS_CONFIG: Record<Exclude<Booking.Status, Booking.Status.PENDING | Booking.Status.ATTENDED>, {
  label: string;
  color: string;
  bg: string;
  message: string;
  icon: string;
}> = {
  confirmed: {
    label: 'Confirmada',
    color: '#2e7d32',
    bg: '#e8f5e9',
    message: 'Sua reserva foi <strong>confirmada</strong> com sucesso!',
    icon: '✓',
  },
  rejected: {
    label: 'Rejeitada',
    color: '#c62828',
    bg: '#ffebee',
    message: 'Infelizmente sua reserva foi <strong>rejeitada</strong>.',
    icon: '✕',
  },
  cancelled: {
    label: 'Cancelada',
    color: '#e65100',
    bg: '#fff3e0',
    message: 'Sua reserva foi <strong>cancelada</strong>.',
    icon: '✕',
  },
  no_show: {
    label: 'Não Comparecida',
    color: '#78350f',
    bg: '#fef3c7',
    message: 'Você <strong>não compareceu</strong> à reserva de sala que solicitou. Esse tipo de ocorrência pode dificultar a aprovação de reservas futuras.',
    icon: '!',
  },
};

export class TemplateStringBookingEmailTemplater implements BookingEmailTemplater {
  private buildHtml(params: BookingEmailParams, status: Exclude<Booking.Status, Booking.Status.PENDING | Booking.Status.ATTENDED>, reason?: string): string {
    const cfg = STATUS_CONFIG[status];

    const reasonBlock = reason
      ? `<div style="margin-top:16px;padding:12px 16px;background:#f5f5f5;border-left:4px solid ${cfg.color};border-radius:4px;">
                   <p style="margin:0;font-size:13px;color:#555;font-weight:600;">Motivo:</p>
                   <p style="margin:4px 0 0;font-size:14px;color:#333;">${reason}</p>
               </div>`
      : '';

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reserva ${cfg.label} - Locomotiva Hub</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Roboto','Helvetica','Arial',sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);max-width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#ffffff;padding:28px 32px;text-align:center;border-bottom:4px solid #1F4A7A;">
              <img src="${logoSrc}" alt="Locomotiva Hub" style="height:70px;object-fit:contain;" />
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background:${cfg.bg};padding:16px 32px;text-align:center;border-bottom:1px solid ${cfg.color}33;">
              <span style="display:inline-flex;align-items:center;gap:8px;font-size:15px;color:${cfg.color};font-weight:600;">
                <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:${cfg.color};color:#fff;font-size:13px;line-height:22px;text-align:center;">${cfg.icon}</span>
                 Reserva ${cfg.label}
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1F4A7A;">Olá, ${params.userName}!</p>
              <p style="margin:0 0 24px;font-size:15px;color:#555;">${cfg.message}</p>

              <!-- Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#64b5f6;text-transform:uppercase;letter-spacing:1px;">Título</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#1a202c;">${params.title}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#64b5f6;text-transform:uppercase;letter-spacing:1px;">Sala</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#1a202c;">${params.roomName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#64b5f6;text-transform:uppercase;letter-spacing:1px;">Data</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#1a202c;">${params.day}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#64b5f6;text-transform:uppercase;letter-spacing:1px;">Horário</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#1a202c;">${params.hourFrom} às ${params.hourTo}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#64b5f6;text-transform:uppercase;letter-spacing:1px;">Pessoas</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#1a202c;">${params.numberOfPeople ? `${params.numberOfPeople} ${params.numberOfPeople === 1 ? 'pessoa' : 'pessoas'}` : 'Não informado'}</p>
                  </td>
                </tr>
              </table>

              ${reasonBlock}

              <p style="margin:28px 0 0;font-size:14px;color:#777;">
                Em caso de dúvidas, entre em contato com a equipe do Locomotiva Hub.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1F4A7A;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#90caf9;">© ${new Date().getFullYear()} Locomotiva Hub · Todos os direitos reservados</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
  }

  async templateForCreatedBooking(params: BookingEmailParams): Promise<string> {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Novo Pedido de Reserva - Locomotiva Hub</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Roboto','Helvetica','Arial',sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);max-width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#ffffff;padding:28px 32px;text-align:center;border-bottom:4px solid #1F4A7A;">
              <img src="${logoSrc}" alt="Locomotiva Hub" style="height:70px;object-fit:contain;" />
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background:#e3f2fd;padding:16px 32px;text-align:center;border-bottom:1px solid #1565c033;">
              <span style="display:inline-flex;align-items:center;gap:8px;font-size:15px;color:#1565c0;font-weight:600;">
                <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#1565c0;color:#fff;font-size:13px;line-height:22px;text-align:center;">⏳</span>
                 Pedido de Reserva Recebido
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1F4A7A;">Olá, ${params.userName}!</p>
              <p style="margin:0 0 24px;font-size:15px;color:#555;">Seu <strong>pedido de reserva</strong> foi recebido e está aguardando aprovação.</p>

              <!-- Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#64b5f6;text-transform:uppercase;letter-spacing:1px;">Título</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#1a202c;">${params.title}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#64b5f6;text-transform:uppercase;letter-spacing:1px;">Sala</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#1a202c;">${params.roomName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#64b5f6;text-transform:uppercase;letter-spacing:1px;">Data</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#1a202c;">${params.day}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#64b5f6;text-transform:uppercase;letter-spacing:1px;">Horário</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#1a202c;">${params.hourFrom} às ${params.hourTo}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#64b5f6;text-transform:uppercase;letter-spacing:1px;">Pessoas</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#1a202c;">${params.numberOfPeople ? `${params.numberOfPeople} ${params.numberOfPeople === 1 ? 'pessoa' : 'pessoas'}` : 'Não informado'}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:14px;color:#777;">
                Em caso de dúvidas, entre em contato com a equipe do Locomotiva Hub.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1F4A7A;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#90caf9;">© ${new Date().getFullYear()} Locomotiva Hub · Todos os direitos reservados</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
  }

  async templateForAdminNewBooking(params: BookingEmailParams, bookingUrl: string): Promise<string> {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Novo Pedido de Reserva - Admin</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Roboto','Helvetica','Arial',sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);max-width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#ffffff;padding:28px 32px;text-align:center;border-bottom:4px solid #1F4A7A;">
              <img src="${logoSrc}" alt="Locomotiva Hub" style="height:70px;object-fit:contain;" />
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background:#fff8e1;padding:16px 32px;text-align:center;border-bottom:1px solid #f9a82533;">
              <span style="display:inline-flex;align-items:center;gap:8px;font-size:15px;color:#e65100;font-weight:600;">
                <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#e65100;color:#fff;font-size:13px;line-height:22px;text-align:center;">!</span>
                Novo Pedido de Reserva Aguardando Aprovação
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1F4A7A;">Atenção, Admin!</p>
              <p style="margin:0 0 24px;font-size:15px;color:#555;">Um novo pedido de reserva foi criado por <strong>${params.userName}</strong> e está aguardando sua aprovação.</p>

              <!-- Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#64b5f6;text-transform:uppercase;letter-spacing:1px;">Solicitante</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#1a202c;">${params.userName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#64b5f6;text-transform:uppercase;letter-spacing:1px;">Título</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#1a202c;">${params.title}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#64b5f6;text-transform:uppercase;letter-spacing:1px;">Sala</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#1a202c;">${params.roomName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#64b5f6;text-transform:uppercase;letter-spacing:1px;">Data</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#1a202c;">${params.day}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#64b5f6;text-transform:uppercase;letter-spacing:1px;">Horário</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#1a202c;">${params.hourFrom} às ${params.hourTo}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#64b5f6;text-transform:uppercase;letter-spacing:1px;">Pessoas</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#1a202c;">${params.numberOfPeople ? `${params.numberOfPeople} ${params.numberOfPeople === 1 ? 'pessoa' : 'pessoas'}` : 'Não informado'}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td align="center">
                    <a href="${bookingUrl}" target="_blank" style="display:inline-block;padding:14px 32px;background:#1F4A7A;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">
                      Ver Pedido de Reserva
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1F4A7A;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#90caf9;">© ${new Date().getFullYear()} Locomotiva Hub · Todos os direitos reservados</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
  }

  async templateForConfirmedBooking(params: BookingEmailParams): Promise<string> {
    return this.buildHtml(params, Booking.Status.CONFIRMED);
  }

  async templateForRejectedBooking(params: BookingEmailParams, reason?: string): Promise<string> {
    return this.buildHtml(params, Booking.Status.REJECTED, reason);
  }

  async templateForCancelledBooking(params: BookingEmailParams): Promise<string> {
    return this.buildHtml(params, Booking.Status.CANCELLED);
  }
}
