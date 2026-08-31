import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { BucketStorageService } from "@storage/domain/services";

export type SupabaseStorageConfig = {
    url: string;
    secretKey: string;
    bucket: string;
    downloadUrlExpiresInSeconds?: number;
};

/**
 * Implementação via SDK oficial @supabase/supabase-js (Supabase Storage).
 * - Upload: a API recebe o arquivo do front e sobe direto pro bucket (`upload`).
 * - Download: `createSignedUrl` — leitura temporária de bucket PRIVADO.
 * - Delete: `remove` — tira o objeto do bucket (a entidade continua no banco,
 *   marcada como deletada).
 * O `path` persistido na entidade é a chave do objeto no bucket.
 */
export class SupabaseBucketStorageService implements BucketStorageService {
    private readonly client: SupabaseClient;
    private readonly bucket: string;
    private readonly expiresIn: number;

    constructor(config: SupabaseStorageConfig) {
        this.client = createClient(config.url, config.secretKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
        this.bucket = config.bucket;
        this.expiresIn = config.downloadUrlExpiresInSeconds ?? 900;
    }

    async uploadFile(file: Blob, params: BucketStorageService.UploadFileParams): Promise<BucketStorageService.UploadFileResult> {
        const safeName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${randomUUID()}-${safeName}`;

        const { data, error } = await this.client.storage
            .from(this.bucket)
            .upload(path, Buffer.from(await file.arrayBuffer()), {
                contentType: params.contentType ?? "application/octet-stream",
            });
        if (error || !data) {
            throw new Error(`Falha ao enviar o arquivo ao Supabase: ${error?.message ?? "sem dados"}`);
        }

        return { path: data.path };
    }

    async createDownloadUrl(path: string, params?: BucketStorageService.CreateDownloadUrlParams): Promise<BucketStorageService.CreateDownloadUrlResult> {
        const { data, error } = await this.client.storage
            .from(this.bucket)
            .createSignedUrl(
                path,
                params?.expiresInSeconds ?? this.expiresIn,
                { download: params?.downloadFileName },
            );
        if (error || !data) {
            throw new Error(`Falha ao gerar URL de download no Supabase: ${error?.message ?? "sem dados"}`);
        }
        return { downloadUrl: data.signedUrl };
    }

    async deleteFile(path: string): Promise<void> {
        const { error } = await this.client.storage.from(this.bucket).remove([path]);
        if (error) {
            throw new Error(`Falha ao remover o arquivo no Supabase: ${error.message}`);
        }
    }
}
