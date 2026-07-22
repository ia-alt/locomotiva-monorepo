import { UniqueId, UseCase } from "@core/base-classes";
import { Filament, PrintRequest } from "@printing/domain/entities";
import { FilamentRepository, PrintRequestRepository } from "@printing/domain/repositories";
import { StoredFileService } from "@storage/domain/services";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { FilamentNotFoundError, PrintRequestNotFoundError } from "../errors";
import { StoredFile } from "src/modules/storage/domain/entities";

class GetPrintRequestByIdUseCase extends UseCase<GetPrintRequestByIdUseCase.Input, GetPrintRequestByIdUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly printRequestRepository: PrintRequestRepository,
        private readonly filamentRepository: FilamentRepository,
        private readonly storedFileService: StoredFileService,
    ) {
        super();
    }

    async execute(params: GetPrintRequestByIdUseCase.Input): Promise<GetPrintRequestByIdUseCase.Output> {
        const user = this.authUserService.getUser();
        const printRequestId = UniqueId.fromString(params.printRequestId);

        const printRequest = await this.printRequestRepository.findById(printRequestId);
        if (!printRequest) {
            throw new PrintRequestNotFoundError(printRequestId);
        }

        if (!user.isAdmin()) {
            printRequest.checkOwner(user.id);
        }

        // o pedido guarda só ids — o detalhe devolve os dados de arquivo/filamento junto
        const [stlFile, gcodeFile, filament] = await Promise.all([
            this.storedFileService.getFile(printRequest.stlFileId),
            this.storedFileService.getFile(printRequest.gcodeFileId),
            this.filamentRepository.findById(printRequest.filamentId),
        ]);
        if (!filament) {
            throw new FilamentNotFoundError(printRequest.filamentId);
        }

        return {
            ...printRequest.toJSON(),
            stlFile: stlFile.toJSON(),
            gcodeFile: gcodeFile.toJSON(),
            filament: filament.toJSON(),
        }
    }
}

namespace GetPrintRequestByIdUseCase {
    export const InputSchema = z.object({
        printRequestId: z.string(),
    });

    export const OutputSchema = PrintRequest.JsonSchema.extend({
        stlFile: StoredFile.JsonSchema,
        gcodeFile: StoredFile.JsonSchema,
        filament: Filament.JsonSchema,
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { GetPrintRequestByIdUseCase };
