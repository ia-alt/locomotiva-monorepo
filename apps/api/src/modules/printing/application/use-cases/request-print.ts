import { PrintRequest } from "@printing/domain/entities";
import { PrintRequestService } from "@printing/domain/services";
import { UniqueId, UseCase } from "@core/base-classes";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

/**
 * O cliente já enviou os arquivos pela rota de upload do storage; aqui chegam
 * só as referências (ids) — o PrintRequestService valida catálogo e arquivos.
 */
class RequestPrintUseCase extends UseCase<RequestPrintUseCase.Input, RequestPrintUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly printRequestService: PrintRequestService,
    ) {
        super();
    }

    async execute(params: RequestPrintUseCase.Input): Promise<RequestPrintUseCase.Output> {
        const user = this.authUserService.getUser();

        const printRequest = await this.printRequestService.createPrintRequest({
            userId: user.id,
            purpose: params.purpose,
            stlFileId: UniqueId.fromString(params.stlFileId),
            gcodeFileId: UniqueId.fromString(params.gcodeFileId),
            filamentId: UniqueId.fromString(params.filamentId),
        });

        return printRequest.toJSON();
    }
}

namespace RequestPrintUseCase {
    export const InputSchema = z.object({
        purpose: z.string(),
        filamentId: z.string(),
        stlFileId: z.string(),
        gcodeFileId: z.string(),
    });

    export const OutputSchema = PrintRequest.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { RequestPrintUseCase };
