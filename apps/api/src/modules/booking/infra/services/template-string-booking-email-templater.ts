import fs from 'node:fs';
import path from 'node:path';
import { BookingEmailTemplater, BookingEmailParams } from '../../domain/services';

const logoBase64 = fs.readFileSync(
  path.join(import.meta.dirname, '../../../../modules/notifications/assets/logo.png')
).toString('base64');
const logoSrc = `data:image/png;base64,${logoBase64}`;

const STATUS_CONFIG = {
  created: {
    label: 'Criada',
    color: '#0277bd',
    bg: '#e1f5fe',
    message: 'Sua reserva foi <strong>criada</strong> e está aguardando confirmação.',
    icon: 'ℹ',
  },
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
};

export class TemplateStringBookingEmailTemplater implements BookingEmailTemplater {
  private buildHtml(params: BookingEmailParams, status: 'created' | 'confirmed' | 'rejected' | 'cancelled', reason?: string): string {
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
            <td style="background:#1F4A7A;padding:28px 32px;text-align:center;">
              <img src="${logoSrc}" alt="Locomotiva Hub" style="height:60px;object-fit:contain;" />
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
                  <td style="padding:20px 24px;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#64b5f6;text-transform:uppercase;letter-spacing:1px;">Horário</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#1a202c;">${params.hourFrom} às ${params.hourTo}</p>
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
    return this.buildHtml(params, 'created');
  }

  async templateForConfirmedBooking(params: BookingEmailParams): Promise<string> {
    return this.buildHtml(params, 'confirmed');
  }

  async templateForRejectedBooking(params: BookingEmailParams, reason?: string): Promise<string> {
    return this.buildHtml(params, 'rejected', reason);
  }

  async templateForCancelledBooking(params: BookingEmailParams): Promise<string> {
    return this.buildHtml(params, 'cancelled');
  }
}
