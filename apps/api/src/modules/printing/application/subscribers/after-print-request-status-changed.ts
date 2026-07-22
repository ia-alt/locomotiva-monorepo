import { DomainEvents } from "@core/base-classes";
import { SendEmailService } from "@notifications/application/services";
import { UserRepository } from "src/modules/identity/domain/repositories";
import { PrintRequestEmailTemplater, PrintRequestEmailParams } from "@printing/domain/services";
import { FilamentRepository } from "@printing/domain/repositories";
import { StoredFileService } from "@storage/domain/services";
import { PrintRequest } from "../../domain/entities";
import { PrintRequestCreatedEvent } from "../../domain/events/print-request-created";
import { PrintRequestApprovedEvent } from "../../domain/events/print-request-approved";
import { PrintRequestRejectedEvent } from "../../domain/events/print-request-rejected";
import { PrintRequestCancelledEvent } from "../../domain/events/print-request-cancelled";
import { PrintRequestCompletedEvent } from "../../domain/events/print-request-completed";
import { env } from "src/modules/env";

export class AfterPrintRequestStatusChanged {
    constructor(
        private readonly sendEmailService: SendEmailService,
        private readonly userRepository: UserRepository,
        private readonly printRequestEmailTemplater: PrintRequestEmailTemplater,
        private readonly filamentRepository: FilamentRepository,
        private readonly storedFileService: StoredFileService,
        private readonly adminUrl: string,
    ) {
        this.setupSubscriptions();
    }

    private setupSubscriptions(): void {
        DomainEvents.register(this.onCreated.bind(this), PrintRequestCreatedEvent.name);
        DomainEvents.register(this.onApproved.bind(this), PrintRequestApprovedEvent.name);
        DomainEvents.register(this.onRejected.bind(this), PrintRequestRejectedEvent.name);
        DomainEvents.register(this.onCancelled.bind(this), PrintRequestCancelledEvent.name);
        DomainEvents.register(this.onCompleted.bind(this), PrintRequestCompletedEvent.name);
    }

    /** O pedido guarda só ids — o e-mail busca o nome do filamento e dos arquivos na hora de montar. */
    private async buildParams(printRequest: PrintRequest, userName: string): Promise<PrintRequestEmailParams> {
        const [stlFile, gcodeFile, filament] = await Promise.all([
            this.storedFileService.getFile(printRequest.stlFileId),
            this.storedFileService.getFile(printRequest.gcodeFileId),
            this.filamentRepository.findById(printRequest.filamentId),
        ]);

        return {
            userName,
            purpose: printRequest.purpose,
            material: filament?.name ?? "desconhecido",
            stlFileName: stlFile.name,
            gcodeFileName: gcodeFile.name,
        };
    }

    private async onCreated(event: PrintRequestCreatedEvent): Promise<void> {
        try {
            const { printRequest } = event;
            const user = await this.userRepository.findById(printRequest.userId);
            if (!user) return;

            const params = await this.buildParams(printRequest, user.firstName);
            const requestUrl = `${this.adminUrl}/print-requests?view=${printRequest.id.value}`;

            const [userHtml, adminHtml] = await Promise.all([
                this.printRequestEmailTemplater.templateForCreated(params),
                this.printRequestEmailTemplater.templateForAdminNew(params, requestUrl),
            ]);

            await Promise.all([
                this.sendEmailService.send(user.email.value, "Pedido de Impressão Recebido - Locomotiva Hub", userHtml),
                this.sendEmailService.send(env.NODEMAILER_EMAIL_USER, `Novo Pedido de Impressão - ${user.firstName}`, adminHtml),
            ]);
            console.log(`[AfterPrintRequestStatusChanged] Email de criação enviado para o pedido ${printRequest.id.value}`);
        } catch (error) {
            console.error("[AfterPrintRequestStatusChanged] Erro ao enviar email de criação:", error);
        }
    }

    private async onApproved(event: PrintRequestApprovedEvent): Promise<void> {
        try {
            const { printRequest } = event;
            const user = await this.userRepository.findById(printRequest.userId);
            if (!user) return;

            const params = await this.buildParams(printRequest, user.firstName);
            const html = await this.printRequestEmailTemplater.templateForApproved(params);
            await this.sendEmailService.send(user.email.value, "Pedido de Impressão Aprovado - Locomotiva Hub", html);
            console.log(`[AfterPrintRequestStatusChanged] Email de aprovação enviado para o pedido ${printRequest.id.value}`);
        } catch (error) {
            console.error("[AfterPrintRequestStatusChanged] Erro ao enviar email de aprovação:", error);
        }
    }

    private async onRejected(event: PrintRequestRejectedEvent): Promise<void> {
        try {
            const { printRequest, reason } = event;
            const user = await this.userRepository.findById(printRequest.userId);
            if (!user) return;

            const params = await this.buildParams(printRequest, user.firstName);
            const html = await this.printRequestEmailTemplater.templateForRejected(params, reason);
            await this.sendEmailService.send(user.email.value, "Pedido de Impressão Recusado - Locomotiva Hub", html);
            console.log(`[AfterPrintRequestStatusChanged] Email de recusa enviado para o pedido ${printRequest.id.value}`);
        } catch (error) {
            console.error("[AfterPrintRequestStatusChanged] Erro ao enviar email de recusa:", error);
        }
    }

    private async onCancelled(event: PrintRequestCancelledEvent): Promise<void> {
        try {
            const { printRequest } = event;
            const user = await this.userRepository.findById(printRequest.userId);
            if (!user) return;

            const params = await this.buildParams(printRequest, user.firstName);
            const html = await this.printRequestEmailTemplater.templateForCancelled(params);
            await this.sendEmailService.send(user.email.value, "Pedido de Impressão Cancelado - Locomotiva Hub", html);
            console.log(`[AfterPrintRequestStatusChanged] Email de cancelamento enviado para o pedido ${printRequest.id.value}`);
        } catch (error) {
            console.error("[AfterPrintRequestStatusChanged] Erro ao enviar email de cancelamento:", error);
        }
    }

    private async onCompleted(event: PrintRequestCompletedEvent): Promise<void> {
        try {
            const { printRequest } = event;
            const user = await this.userRepository.findById(printRequest.userId);
            if (!user) return;

            const params = await this.buildParams(printRequest, user.firstName);
            const html = await this.printRequestEmailTemplater.templateForCompleted(params);
            await this.sendEmailService.send(user.email.value, "Impressão Pronta para Retirada - Locomotiva Hub", html);
            console.log(`[AfterPrintRequestStatusChanged] Email de finalização enviado para o pedido ${printRequest.id.value}`);
        } catch (error) {
            console.error("[AfterPrintRequestStatusChanged] Erro ao enviar email de finalização:", error);
        }
    }
}
