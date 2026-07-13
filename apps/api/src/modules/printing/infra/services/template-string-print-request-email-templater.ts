import { PrintRequestEmailTemplater, PrintRequestEmailParams } from "@printing/domain/services";

const logoSrc = "cid:logo@locomotiva";

type Banner = { label: string; color: string; bg: string; icon: string };

export class TemplateStringPrintRequestEmailTemplater implements PrintRequestEmailTemplater {
    private detailsTable(params: PrintRequestEmailParams): string {
        const rows: Array<[string, string]> = [
            ["Motivo da impressão", params.purpose],
            ["Material", params.material.toUpperCase()],
            ["Modelo 3D (.stl)", params.stlFileName],
            ["Arquivo fatiado (.gcode)", params.gcodeFileName],
        ];
        const cells = rows.map(([label, value], i) => `
            <tr>
              <td style="padding:18px 24px;${i < rows.length - 1 ? "border-bottom:1px solid #e2e8f0;" : ""}">
                <p style="margin:0;font-size:11px;font-weight:700;color:#64b5f6;text-transform:uppercase;letter-spacing:1px;">${label}</p>
                <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#1a202c;">${value}</p>
              </td>
            </tr>`).join("");
        return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">${cells}</table>`;
    }

    private buildShell(title: string, banner: Banner, greetingName: string, intro: string, bodyHtml: string): string {
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Roboto','Helvetica','Arial',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);max-width:100%;">
        <tr>
          <td style="background:#ffffff;padding:28px 32px;text-align:center;border-bottom:4px solid #1F4A7A;">
            <img src="${logoSrc}" alt="Locomotiva Hub" style="height:70px;object-fit:contain;" />
          </td>
        </tr>
        <tr>
          <td style="background:${banner.bg};padding:16px 32px;text-align:center;border-bottom:1px solid ${banner.color}33;">
            <span style="display:inline-flex;align-items:center;gap:8px;font-size:15px;color:${banner.color};font-weight:600;">
              <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:${banner.color};color:#fff;font-size:13px;line-height:22px;text-align:center;">${banner.icon}</span>
              ${banner.label}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1F4A7A;">Olá, ${greetingName}!</p>
            <p style="margin:0 0 24px;font-size:15px;color:#555;">${intro}</p>
            ${bodyHtml}
            <p style="margin:28px 0 0;font-size:14px;color:#777;">Em caso de dúvidas, entre em contato com a equipe do Locomotiva Hub.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#1F4A7A;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#90caf9;">© ${new Date().getFullYear()} Locomotiva Hub · Todos os direitos reservados</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
    }

    private reasonBlock(reason?: string): string {
        if (!reason) return "";
        return `<div style="margin-top:16px;padding:12px 16px;background:#f5f5f5;border-left:4px solid #c62828;border-radius:4px;">
          <p style="margin:0;font-size:13px;color:#555;font-weight:600;">Motivo:</p>
          <p style="margin:4px 0 0;font-size:14px;color:#333;">${reason}</p>
        </div>`;
    }

    async templateForCreated(params: PrintRequestEmailParams): Promise<string> {
        return this.buildShell(
            "Pedido de Impressão Recebido - Locomotiva Hub",
            { label: "Pedido de Impressão Recebido", color: "#1565c0", bg: "#e3f2fd", icon: "⏳" },
            params.userName,
            "Seu <strong>pedido de impressão 3D</strong> foi recebido e está aguardando análise do nosso técnico.",
            this.detailsTable(params),
        );
    }

    async templateForAdminNew(params: PrintRequestEmailParams, requestUrl: string): Promise<string> {
        const cta = `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;"><tr><td align="center">
            <a href="${requestUrl}" target="_blank" style="display:inline-block;padding:14px 32px;background:#1F4A7A;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">Ver Pedido de Impressão</a>
          </td></tr></table>`;
        return this.buildShell(
            "Novo Pedido de Impressão - Admin",
            { label: "Novo Pedido de Impressão Aguardando Análise", color: "#e65100", bg: "#fff8e1", icon: "!" },
            "Técnico",
            `Um novo pedido de impressão 3D foi criado por <strong>${params.userName}</strong> e está aguardando análise.`,
            this.detailsTable(params) + cta,
        );
    }

    async templateForApproved(params: PrintRequestEmailParams): Promise<string> {
        const instructions = `<div style="margin-top:20px;padding:16px 20px;background:#e8f5e9;border-radius:12px;border:1px solid #2e7d3233;font-size:14px;color:#33513a;line-height:1.6;">
          <p style="margin:0 0 8px;">Será uma honra acolher você! Para fazer a impressão no Locomotiva Hub, você precisa estar com seu projeto pronto, fatiado ao ponto de imprimir.</p>
          <p style="margin:0 0 8px;">O Locomotiva Hub está aberto de segunda a sexta, das 8:00 às 17:00. O uso da impressão 3D é totalmente gratuito.</p>
          <p style="margin:0;">O filamento utilizado será <strong>${params.material.toUpperCase()}</strong>. Aconselhamos vir ao espaço acompanhar a configuração da impressora, caso seja necessário algum ajuste no projeto.</p>
        </div>`;
        return this.buildShell(
            "Pedido de Impressão Aprovado - Locomotiva Hub",
            { label: "Pedido de Impressão Aprovado", color: "#2e7d32", bg: "#e8f5e9", icon: "✓" },
            params.userName,
            "Tudo bem? Seu <strong>pedido de impressão 3D</strong> foi <strong>aprovado</strong>!",
            this.detailsTable(params) + instructions,
        );
    }

    async templateForRejected(params: PrintRequestEmailParams, reason?: string): Promise<string> {
        return this.buildShell(
            "Pedido de Impressão Recusado - Locomotiva Hub",
            { label: "Pedido de Impressão Recusado", color: "#c62828", bg: "#ffebee", icon: "✕" },
            params.userName,
            "Infelizmente seu <strong>pedido de impressão 3D</strong> foi <strong>recusado</strong>.",
            this.detailsTable(params) + this.reasonBlock(reason),
        );
    }

    async templateForCancelled(params: PrintRequestEmailParams): Promise<string> {
        return this.buildShell(
            "Pedido de Impressão Cancelado - Locomotiva Hub",
            { label: "Pedido de Impressão Cancelado", color: "#e65100", bg: "#fff3e0", icon: "✕" },
            params.userName,
            "Seu <strong>pedido de impressão 3D</strong> foi <strong>cancelado</strong>.",
            this.detailsTable(params),
        );
    }

    async templateForCompleted(params: PrintRequestEmailParams): Promise<string> {
        return this.buildShell(
            "Impressão Pronta para Retirada - Locomotiva Hub",
            { label: "Pronta para Retirada", color: "#2e7d32", bg: "#e8f5e9", icon: "✓" },
            params.userName,
            "Boas notícias! Sua <strong>impressão 3D está pronta para retirada</strong> — você já pode buscá-la no Locomotiva Hub.",
            this.detailsTable(params),
        );
    }
}
