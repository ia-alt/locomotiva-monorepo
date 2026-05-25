import { UniqueId } from "@core/base-classes";
import { AccessLogRepository } from "../repositories";
import { UserRepository } from "src/modules/identity/domain/repositories";
import { OnlyDate } from "@core/value-objects";
import { AccessLogWithUser } from "../value-objects/access-log-with-user";


class AccessLogService {
    constructor(
        private readonly accessLogRepository: AccessLogRepository,
        private readonly userRepository: UserRepository,
    ) { }

    async findAllByDayWithUsers(day: OnlyDate): Promise<AccessLogWithUser[]> {
        const accessLogs = await this.accessLogRepository.findAllByDay(day);

        if (accessLogs.length === 0) return [];

        const userIds = accessLogs.map(log => UniqueId.fromString(log.userId.value));
        const users = await this.userRepository.findManyByIds(userIds);
        const userMap = new Map(users.map(u => [u.id.value, u]));

        const items: AccessLogWithUser[] = [];
        for (const accessLog of accessLogs) {
            const user = userMap.get(accessLog.userId.value);
            if (!user) continue;

            const item = new AccessLogWithUser({accessLog, user})
            items.push(item);
        }
        return items;
    }

    async findAllByMonthWithUsers(year: number, month: number): Promise<AccessLogWithUser[]> {
        const accessLogs = await this.accessLogRepository.findAllByMonth(year, month);

        if (accessLogs.length === 0) return [];

        const userIds = accessLogs.map(log => UniqueId.fromString(log.userId.value));
        const users = await this.userRepository.findManyByIds(userIds);
        const userMap = new Map(users.map(u => [u.id.value, u]));

        const items: AccessLogWithUser[] = [];
        for (const accessLog of accessLogs) {
            const user = userMap.get(accessLog.userId.value);
            if (!user) continue;
            items.push(new AccessLogWithUser({ accessLog, user }));
        }
        return items;
    }
}


export { AccessLogService };
