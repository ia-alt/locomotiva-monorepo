import { UseCase } from "@core/base-classes";
import { StoredFile } from "@storage/domain/entities";
import { StoredFileService } from "@storage/domain/services";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

/**
 * O front envia o arquivo pra API (multipart); a API sobe pro bucket e
 * registra a entidade. Devolve só o que o cliente pode ver (id, nome, tamanho).
 */
class UploadFileUseCase extends UseCase<UploadFileUseCase.Input, UploadFileUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly storedFileService: StoredFileService,
    ) {
        super();
    }

    async execute(params: UploadFileUseCase.Input): Promise<UploadFileUseCase.Output> {
        const user = this.authUserService.getUser();

        const storedFile = await this.storedFileService.uploadFile(params.file, {
            fileName: params.fileName,
            uploadedByUserId: user.id,
        });

        return storedFile.toJSON();
    }
}

namespace UploadFileUseCase {
    export const InputSchema = z.object({
        file: z.file(),
        fileName: z.string(),
    });

    export const OutputSchema = StoredFile.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { UploadFileUseCase };
