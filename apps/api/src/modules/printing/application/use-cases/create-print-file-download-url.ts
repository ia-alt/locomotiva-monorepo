import { UniqueId, UseCase } from "@core/base-classes";
import { PrintRequestRepository } from "@printing/domain/repositories";
import { StoredFileService } from "@storage/domain/services";
import { FileDeletedError } from "@storage/domain/errors";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { PrintRequestNotFoundError } from "../errors";

/**
 * Gera uma URL temporária de download (presigned GET) para um dos arquivos do
 * pedido. Restrito a quem pode ver o pedido: admin (qualquer) ou o próprio dono.
 * O storage recebe a entidade StoredFile — o path do bucket não circula fora dela.
 */
class CreatePrintFileDownloadUrlUseCase extends UseCase<CreatePrintFileDownloadUrlUseCase.Input, CreatePrintFileDownloadUrlUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly printRequestRepository: PrintRequestRepository,
        private readonly storedFileService: StoredFileService,
    ) {
        super();
    }

    async execute(params: CreatePrintFileDownloadUrlUseCase.Input): Promise<CreatePrintFileDownloadUrlUseCase.Output> {
        const user = this.authUserService.getUser();
        const printRequestId = UniqueId.fromString(params.printRequestId);

        const printRequest = await this.printRequestRepository.findById(printRequestId);
        if (!printRequest) {
            throw new PrintRequestNotFoundError(printRequestId);
        }

        if (!user.isAdmin()) {
            printRequest.checkOwner(user.id);
        }

        const fileId = params.file === "stl" ? printRequest.stlFileId : printRequest.gcodeFileId;
        const file = await this.storedFileService.getFile(fileId);
        if (file.deleted) {
            throw new FileDeletedError();
        }

        const downloadUrl = await this.storedFileService.createDownloadUrl(file);

        return { downloadUrl };
    }
}

namespace CreatePrintFileDownloadUrlUseCase {
    export const InputSchema = z.object({
        printRequestId: z.string(),
        file: z.enum(["stl", "gcode"]),
    });

    export const OutputSchema = z.object({
        downloadUrl: z.string(),
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { CreatePrintFileDownloadUrlUseCase };
