import { CoworkingSettings } from "../entities";

export interface CoworkingSettingsRepository {
    save(coworking: CoworkingSettings): Promise<void>;
    get(): Promise<CoworkingSettings>;
}
