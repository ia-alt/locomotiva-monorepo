import { UniqueId, UseCase } from "@core/base-classes";
import { AccessLogRepository } from "@coworking/domain/repositories";
import { UserRepository } from "@identy/domain/repositories";
import { AuthUserService } from "@identy/domain/services";
import z from "zod";

class ListActiveSessionsUseCase extends UseCase<void, ListActiveSessionsUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly accessLogRepository: AccessLogRepository,
        private readonly userRepository: UserRepository,
    ) {
        super();
    }

    async execute(): Promise<ListActiveSessionsUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const activeLogs = await this.accessLogRepository.findAllActive();
        if (activeLogs.length === 0) return [];

        const userIds = activeLogs.map(log => UniqueId.fromString(log.toJSON().userId));
        const users = await this.userRepository.findManyByIds(userIds);

        const userMap = new Map(users.map(u => {
            const json = u.toJSON();
            return [json.id, json];
        }));

        return activeLogs
            .map(log => {
                const { id, userId, entryTime } = log.toJSON();
                const user = userMap.get(userId);
                return {
                    logId: id,
                    userId,
                    userName: user?.name ?? 'Usuário não encontrado',
                    userEmail: user?.email ?? '',
                    entryTime,
                };
            })
            .sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime());
    }
}

namespace ListActiveSessionsUseCase {
    export const ActiveSessionSchema = z.object({
        logId: z.string(),
        userId: z.string(),
        userName: z.string(),
        userEmail: z.string(),
        entryTime: z.string(),
    });

    export const OutputSchema = z.array(ActiveSessionSchema);

    export type Output = z.infer<typeof OutputSchema>;
    export type ActiveSession = z.infer<typeof ActiveSessionSchema>;
}

export { ListActiveSessionsUseCase };
