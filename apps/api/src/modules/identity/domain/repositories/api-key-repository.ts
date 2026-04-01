import { ApiKey } from "../entities/api-key";
import { UniqueId } from "src/modules/_core/base-classes";

export interface ApiKeyRepository {
    save(apiKey: ApiKey): Promise<void>;
    findAll(): Promise<ApiKey[]>;
    findById(id: UniqueId): Promise<ApiKey | null>;
    findByKeyHash(keyHash: string): Promise<ApiKey | null>;
    delete(id: UniqueId): Promise<void>;
}
