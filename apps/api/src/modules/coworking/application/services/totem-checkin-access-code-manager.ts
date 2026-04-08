import { ApiKey } from "src/modules/identity/domain/entities";

export interface TotemCheckinAccessCodeManager {
    generateAccessCode(totemApiKey: ApiKey): Promise<string>;
    validateAccessCode(accessCode: string): Promise<ApiKey | null>;
}