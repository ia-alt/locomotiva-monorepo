import { UniqueId } from "@core/base-classes";
import { StoredFile } from "@storage/domain/entities";
import { StoredFileRepository } from "@storage/domain/repositories";
import { BucketStorageService } from "./bucket-storage-service";
import { FileNotFoundError } from "../errors";

/**
 * Ciclo de vida do arquivo: o front envia o arquivo pra API, a API sobe pro
 * bucket e registra a entidade `StoredFile` — o cliente só recebe o toJSON
 * (id, nome), nunca o path do bucket.
 */
class StoredFileService {
    constructor(
        private readonly storedFileRepository: StoredFileRepository,
        private readonly bucketStorageService: BucketStorageService,
    ) { }

    async uploadFile(file: Blob, params: StoredFileService.UploadFileParams): Promise<StoredFile> {
        const { path } = await this.bucketStorageService.uploadFile(file, {
            fileName: params.fileName,
            contentType: file.type || "application/octet-stream",
        });

        const storedFile = StoredFile.create({
            name: params.fileName,
            path,
            sizeBytes: file.size,
            uploadedByUserId: params.uploadedByUserId,
        });
        await this.storedFileRepository.save(storedFile);
        return storedFile;
    }

    /**
     * Remove o objeto do bucket e marca a entidade como deletada — usado quando
     * o arquivo subiu mas o que dependia dele não se concretizou (ex.: o pedido
     * de impressão falhou depois do upload), pra não deixar lixo no bucket.
     */
    async deleteFile(file: StoredFile): Promise<void> {
        await this.bucketStorageService.deleteFile(file.path);
        file.markDeleted();
        await this.storedFileRepository.save(file);
    }

    async createDownloadUrl(file:StoredFile): Promise<string> {
        const result = await this.bucketStorageService.createDownloadUrl(file.path, {downloadFileName: file.name});
        return result.downloadUrl;
    }

    /** Busca o arquivo ou dispara `FileNotFoundError` — o chamador não precisa tratar null. */
    async getFile(id: UniqueId): Promise<StoredFile> {
        const file = await this.storedFileRepository.findById(id);
        if (!file) {
            throw new FileNotFoundError(id);
        }
        return file;
    }
}

namespace StoredFileService {
    export type UploadFileParams = {
        fileName: string;
        uploadedByUserId: UniqueId;
    };
}

export { StoredFileService };
