import { UseCase } from "@core/base-classes";
import { AccessLogRepository } from "@coworking/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

class GetWeeklyFrequencyUseCase implements UseCase<void, GetWeeklyFrequencyUseCase.Output> {
    constructor(
        private readonly accessLogRepository: AccessLogRepository,
        private readonly authUserService: AuthUserService,
    ) { }

    async execute(): Promise<GetWeeklyFrequencyUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 6 days ago (inclusive) → today (inclusive), today is the rightmost bar
        const since = new Date(today);
        since.setDate(today.getDate() - 6);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const logs = await this.accessLogRepository.findEntriesInRange(since, tomorrow);

        const days: GetWeeklyFrequencyUseCase.DayCount[] = [];
        for (let i = 6; i >= 0; i--) {
            const day = new Date(today);
            day.setDate(today.getDate() - i);
            const y = day.getFullYear();
            const m = String(day.getMonth() + 1).padStart(2, '0');
            const d = String(day.getDate()).padStart(2, '0');
            days.push({ date: `${y}-${m}-${d}`, count: 0 });
        }

        const seenUserDay = new Set<string>();
        for (const log of logs) {
            const json = log.toJSON();
            const entry = new Date(json.entryTime);
            const y = entry.getFullYear();
            const m = String(entry.getMonth() + 1).padStart(2, '0');
            const d = String(entry.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}`;
            const key = `${json.userId}::${dateStr}`;
            if (seenUserDay.has(key)) continue;
            seenUserDay.add(key);
            const dayEntry = days.find(de => de.date === dateStr);
            if (dayEntry) dayEntry.count++;
        }

        return days;
    }
}

namespace GetWeeklyFrequencyUseCase {
    export const DayCountSchema = z.object({
        date: z.string(),
        count: z.number(),
    });

    export const InputSchema = z.object({});
    export const OutputSchema = z.array(DayCountSchema);

    export type DayCount = z.infer<typeof DayCountSchema>;
    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { GetWeeklyFrequencyUseCase };
