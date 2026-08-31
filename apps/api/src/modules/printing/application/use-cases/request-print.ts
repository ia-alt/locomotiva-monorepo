import { PrintRequest } from "@printing/domain/entities";
import { PrintRequestService } from "@printing/domain/services";
import { UniqueId, UseCase } from "@core/base-classes";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

/**
 * Os arquivos vêm no mesmo request do pedido (multipart) — nada é enviado ao
 * bucket enquanto o cliente não finaliza a solicitação. O PrintRequestService
 * valida catálogo e extensões, sobe os arquivos e cria o pedido.
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
            stlFile: { file: params.stlFile, fileName: params.stlFileName },
            gcodeFile: { file: params.gcodeFile, fileName: params.gcodeFileName },
            filamentId: UniqueId.fromString(params.filamentId),
        });

        return printRequest.toJSON();
    }
}

namespace RequestPrintUseCase {
    export const InputSchema = z.object({
        purpose: z.string(),
        filamentId: z.string(),
        stlFile: z.file(),
        stlFileName: z.string(),
        gcodeFile: z.file(),
        gcodeFileName: z.string(),
    });

    export const OutputSchema = PrintRequest.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { RequestPrintUseCase };
