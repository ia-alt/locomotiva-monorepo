import { ApiKey } from "../entities/api-key";

export interface ApiKeyRepository {
    save(apiKey: ApiKey): Promise<void>;
    findAll(): Promise<ApiKey[]>;
    findById(id: string): Promise<ApiKey | null>;
    findByKeyHash(keyHash: string): Promise<ApiKey | null>;
    deactivate(id: string): Promise<void>;
    delete(id: string): Promise<void>;
}
