import { ApiKey } from "../entities/api-key";
import { PaginatedQuery, PaginatedResult } from "@core/value-objects";

export interface ApiKeyRepository {
    save(apiKey: ApiKey): Promise<void>;
    findById(id: string): Promise<ApiKey | null>;
    findByKeyHash(keyHash: string): Promise<ApiKey | null>;
    delete(id: string): Promise<void>;
    findAll(pagination: PaginatedQuery, search?: string): Promise<PaginatedResult<typeof ApiKey.JsonSchema, ApiKey>>;
}
