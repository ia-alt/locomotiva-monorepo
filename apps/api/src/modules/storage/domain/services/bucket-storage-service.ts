interface BucketStorageService {
    uploadFile(file: Blob, params: BucketStorageService.UploadFileParams): Promise<BucketStorageService.UploadFileResult>;
    createDownloadUrl(path: string, params?: BucketStorageService.CreateDownloadUrlParams): Promise<BucketStorageService.CreateDownloadUrlResult>;
    deleteFile(path: string): Promise<void>;
}

namespace BucketStorageService {
    export type UploadFileParams = {
        fileName: string;
        contentType?: string;
    };

    export type UploadFileResult = {
        path: string;
    };

    export type CreateDownloadUrlParams = {
        expiresInSeconds?: number;
        downloadFileName?: string;
    };

    export type CreateDownloadUrlResult = {
        downloadUrl: string;
    };
}

export { BucketStorageService };
