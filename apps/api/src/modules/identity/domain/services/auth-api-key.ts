import { ApiKey } from "src/modules/identity/domain/entities/api-key";

export class AuthApiKeyService {
    constructor(private readonly apiKey: ApiKey) { }

    getApiKey(): ApiKey {
        return this.apiKey;
    }
}
