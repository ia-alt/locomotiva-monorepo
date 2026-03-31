import { UniqueId } from "@core/base-classes";
import { AccessLogRepository } from "../repositories";
import { AccessLog } from "../entities";
import { CoworkingSettingsRepository } from "@coworking/domain/repositories";
import { CoworkingFullCapacityError, UserAlreadyHasActiveCheckinError, UserDoesNotHaveActiveCheckinError } from "../errors";

export class AccessService {
    constructor(
        private readonly accessLogRepository: AccessLogRepository,
        private readonly coworkingSettingsRepository: CoworkingSettingsRepository,
    ) { }

    async checkInUser(userId: UniqueId, totemName?: string | null): Promise<AccessLog> {
        const activeLog = await this.accessLogRepository.findByUserIdAndActive(userId);
        if (activeLog) {
            throw new UserAlreadyHasActiveCheckinError();
        }

        const coworkingSettings = await this.coworkingSettingsRepository.get();

        const activeLogs = await this.accessLogRepository.findAllActive();
        if (!coworkingSettings.hasSpace(activeLogs.length)) {
            throw new CoworkingFullCapacityError();
        }

        const accessLog = AccessLog.create({ userId, checkinTotemName: totemName });
        await this.accessLogRepository.save(accessLog);

        return accessLog;
    }

    async checkOutUser(userId: UniqueId): Promise<AccessLog> {
        const activeLog = await this.accessLogRepository.findByUserIdAndActive(userId);
        if (!activeLog) {
            throw new UserDoesNotHaveActiveCheckinError();
        }

        activeLog.doCheckout();
        await this.accessLogRepository.save(activeLog);

        return activeLog;
    }

    async checkOutAll(): Promise<{ processedCount: number }> {
        const activeCheckins = await this.accessLogRepository.findAllActive();
        activeCheckins.forEach(checkin => {
            checkin.doCheckout();
        });
        await this.accessLogRepository.saveMany(activeCheckins);

        return { processedCount: activeCheckins.length };
    }
}