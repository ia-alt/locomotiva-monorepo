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

        // os arquivos precisam existir no storage e ter a extensão do seu tipo
        const stlFile = await this.storedFileService.getFile(params.stlFileId);
        this.checkPrintFile(stlFile, "stl");
        const gcodeFile = await this.storedFileService.getFile(params.gcodeFileId);
        this.checkPrintFile(gcodeFile, "gcode");

        const printRequest = PrintRequest.create({
            userId: params.userId,
            purpose: params.purpose,
            stlFileId: params.stlFileId,
            gcodeFileId: params.gcodeFileId,
            filamentId: params.filamentId,
        });
        await this.printRequestRepository.save(printRequest);
        return printRequest;
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

    private checkPrintFile(file: StoredFile, kind: PrintFileKind): void {
        if (file.deleted) {
            throw new InvalidPrintFileError("O arquivo não está mais disponível no armazenamento.");
        }
        if (!EXTENSIONS[kind].includes(file.extension)) {
            throw new InvalidPrintFileError(`O arquivo precisa ser um ${EXTENSIONS[kind][0]} (${LABELS[kind]}).`);
        }
    }
}

namespace PrintRequestService {
    export type CreatePrintRequestParams = {
        userId: UniqueId;
        purpose: string;
        stlFileId: UniqueId;
        gcodeFileId: UniqueId;
        filamentId: UniqueId;
    };
}

export { PrintRequestService };
