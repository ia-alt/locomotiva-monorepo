import { UniqueId } from "@core/base-classes";
import { PrintRequestRepository, PrinterRepository, FilamentRepository } from "@printing/domain/repositories";
import { StoredFile } from "@storage/domain/entities";
import { StoredFileService } from "@storage/domain/services";
import { UserRepository } from "src/modules/identity/domain/repositories";
import { PrintRequest } from "../entities/print-request";
import { PrintRequestWithDetails } from "../value-objects/print-request-with-details";
import { NoPrinterAvailableError, MaterialNotAvailableError, PrinterBusyError, InvalidPrintFileError } from "../errors";

type PrintFileKind = "stl" | "gcode";

const EXTENSIONS: Record<PrintFileKind, string[]> = {
    stl: [".stl"],
    gcode: [".gcode", ".gco"],
};

const LABELS: Record<PrintFileKind, string> = {
    stl: "modelo 3D",
    gcode: "modelo fatiado, pronto para impressão",
};

class PrintRequestService {
    constructor(
        private readonly printRequestRepository: PrintRequestRepository,
        private readonly printerRepository: PrinterRepository,
        private readonly filamentRepository: FilamentRepository,
        private readonly storedFileService: StoredFileService,
        private readonly userRepository: UserRepository,
    ) { }

    async createPrintRequest(params: PrintRequestService.CreatePrintRequestParams): Promise<PrintRequest> {
        const enabledPrinters = await this.printerRepository.findAllEnabled();
        if (enabledPrinters.length === 0) {
            throw new NoPrinterAvailableError();
        }

        // o material precisa ser um filamento ativo do catálogo do admin —
        // um desativado ainda existe (histórico) mas não pode ser escolhido
        const filament = await this.filamentRepository.findById(params.filamentId);
        if (!filament || !filament.active) {
            throw new MaterialNotAvailableError();
        }

        // extensão conferida ANTES do upload: o arquivo só vai pro bucket depois
        // que o resto do pedido já passou por todas as validações
        this.checkPrintFileName(params.stlFile.fileName, "stl");
        this.checkPrintFileName(params.gcodeFile.fileName, "gcode");

        const { stlFile, gcodeFile } = await this.uploadPrintFiles(params);

        try {
            const printRequest = PrintRequest.create({
                userId: params.userId,
                purpose: params.purpose,
                stlFileId: stlFile.id,
                gcodeFileId: gcodeFile.id,
                filamentId: params.filamentId,
            });
            await this.printRequestRepository.save(printRequest);
            return printRequest;
        } catch (error) {
            // o pedido não nasceu: os arquivos não podem ficar no bucket sem dono
            await this.discardUploadedFiles(stlFile, gcodeFile);
            throw error;
        }
    }

    /**
     * Regra de ocupação: uma impressora só pode ter um pedido EM PRODUÇÃO por
     * vez. Igual ao checkIsAdmin — dispara erro em vez de retornar (e evita
     * duplicar a verificação nos use cases de alocar/iniciar produção).
     */
    async checkPrinterIsFree(printerId: UniqueId, ignorePrintRequestId?: UniqueId): Promise<void> {
        const inProduction = await this.printRequestRepository.findInProductionByPrinterId(printerId);
        if (inProduction && !(ignorePrintRequestId && inProduction.id.equals(ignorePrintRequestId))) {
            throw new PrinterBusyError();
        }
    }

    /**
     * Pedidos criados no mês com quem pediu, o material e a impressora — para o
     * relatório. Impressoras e filamentos vêm do catálogo inteiro (inclui
     * desativados), porque o histórico pode apontar para itens já desligados.
     */
    async findAllByMonthWithDetails(year: number, month: number): Promise<PrintRequestWithDetails[]> {
        const printRequests = await this.printRequestRepository.findAllByMonth(year, month);
        if (printRequests.length === 0) return [];

        const [users, filaments, printers] = await Promise.all([
            this.userRepository.findManyByIds(printRequests.map(pr => pr.userId)),
            this.filamentRepository.findAll(),
            this.printerRepository.findAll(),
        ]);

        const userMap = new Map(users.map(u => [u.id.value, u]));
        const filamentMap = new Map(filaments.map(f => [f.id.value, f]));
        const printerMap = new Map(printers.map(p => [p.id.value, p]));

        const items: PrintRequestWithDetails[] = [];
        for (const printRequest of printRequests) {
            const user = userMap.get(printRequest.userId.value);
            const filament = filamentMap.get(printRequest.filamentId.value);
            if (!user || !filament) continue;
            const printer = printRequest.printerId ? printerMap.get(printRequest.printerId.value) ?? null : null;
            items.push(new PrintRequestWithDetails({ printRequest, user, filament, printer }));
        }
        return items;
    }

    /**
     * Os dois arquivos sobem juntos, no momento em que o pedido é enviado. Se o
     * segundo falhar, o primeiro não pode ficar sozinho no bucket.
     */
    private async uploadPrintFiles(params: PrintRequestService.CreatePrintRequestParams): Promise<{ stlFile: StoredFile; gcodeFile: StoredFile }> {
        const stlFile = await this.storedFileService.uploadFile(params.stlFile.file, {
            fileName: params.stlFile.fileName,
            uploadedByUserId: params.userId,
        });

        try {
            const gcodeFile = await this.storedFileService.uploadFile(params.gcodeFile.file, {
                fileName: params.gcodeFile.fileName,
                uploadedByUserId: params.userId,
            });
            return { stlFile, gcodeFile };
        } catch (error) {
            await this.discardUploadedFiles(stlFile);
            throw error;
        }
    }

    /** Uma falha na limpeza não pode esconder o erro que a disparou. */
    private async discardUploadedFiles(...files: StoredFile[]): Promise<void> {
        await Promise.all(
            files.map(file => this.storedFileService.deleteFile(file).catch(() => undefined)),
        );
    }

    private checkPrintFileName(fileName: string, kind: PrintFileKind): void {
        const name = fileName.trim().toLowerCase();
        if (!EXTENSIONS[kind].some(extension => name.endsWith(extension))) {
            throw new InvalidPrintFileError(`O arquivo precisa ser um ${EXTENSIONS[kind][0]} (${LABELS[kind]}).`);
        }
    }
}

namespace PrintRequestService {
    export type CreatePrintRequestParams = {
        userId: UniqueId;
        purpose: string;
        stlFile: PrintRequestService.PrintFileUpload;
        gcodeFile: PrintRequestService.PrintFileUpload;
        filamentId: UniqueId;
    };

    /** O arquivo cru que o cliente enviou junto com o pedido. */
    export type PrintFileUpload = {
        file: Blob;
        fileName: string;
    };
}

export { PrintRequestService };
