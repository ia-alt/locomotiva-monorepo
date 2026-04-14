import { ApiKey } from "src/modules/identity/domain/entities";
import { TotemCheckinAccessCodeManager } from "../../application/services/totem-checkin-access-code-manager";
import { ApiKeyRepository } from "src/modules/identity/domain/repositories";
import { UniqueId } from "src/modules/_core/base-classes";

export class MemoryTotemCheckinAccessCodeManager implements TotemCheckinAccessCodeManager {
    private codes: Map<string, string>;

    constructor(
        private readonly apiKeyRepository: ApiKeyRepository
    ) {
        this.codes = new Map<string, string>();
    }


    generateAccessCode(totemApiKey: ApiKey): Promise<string> {
        const code = this.generateRandomCode();
        this.codes.set(totemApiKey.id.value, code);
        return Promise.resolve(code);
    }

    async validateAccessCode(accessCode: string): Promise<ApiKey | null> {
        const entry = Array.from(this.codes.entries()).find(([_, code]) => code === accessCode);
        if (!entry) {
            return Promise.resolve(null);
        }
        const apiKeyId = UniqueId.fromString(entry[0]);
        const apiKey = await this.apiKeyRepository.findById(apiKeyId);
        return Promise.resolve(apiKey);
    }

    private generateRandomCode(): string {
        let code: string;
        do {
            code = Math.random().toString(36).substring(2, 8).toUpperCase();
        } while (Array.from(this.codes.values()).includes(code));
        return code;
    }
}