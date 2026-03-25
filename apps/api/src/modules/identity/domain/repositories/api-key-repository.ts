import { ApiKey } from "../entities/api-key";

export interface ApiKeyRepository {
    save(apiKey: ApiKey): Promise<void>;
    findById(id: string): Promise<ApiKey | null>;
    findByKeyHash(keyHash: string): Promise<ApiKey | null>;
    delete(id: string): Promise<void>;
}
