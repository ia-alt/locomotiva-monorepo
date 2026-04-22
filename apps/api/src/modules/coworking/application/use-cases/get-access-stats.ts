import { UseCase } from "@core/base-classes";
import { AccessLogRepository } from "@coworking/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

function toDateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
}

class GetAccessStatsUseCase implements UseCase<void, GetAccessStatsUseCase.Output> {
    constructor(
        private readonly accessLogRepository: AccessLogRepository,
        private readonly authUserService: AuthUserService,
    ) { }

    async execute(): Promise<GetAccessStatsUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = toDateStr(today);

        // Current week (Mon–Sun)
        const monday = new Date(today);
        monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
        const nextMonday = new Date(monday);
        nextMonday.setDate(monday.getDate() + 7);

        // Current month
        const curYear = today.getFullYear();
        const curMonth = today.getMonth();
        const curMonthStart = new Date(curYear, curMonth, 1);
        const curMonthEnd = new Date(curYear, curMonth + 1, 1);

        // Previous month
        const prevMonthStart = new Date(curYear, curMonth - 1, 1);
        const prevMonthEnd = curMonthStart;

        // Year start — extend fetch range to cover Jan 1 of current year
        const yearStart = new Date(curYear, 0, 1);
        const earliestFetch = prevMonthStart < yearStart ? prevMonthStart : yearStart;

        // Fetch all data in a single query spanning year start (or prev month) to week end
        const logs = await this.accessLogRepository.findEntriesInRange(earliestFetch, nextMonday);

        // Count unique users per day — a user who checks in multiple times on the same day counts only once
        const seenUserDay = new Set<string>();
        const countByDate = new Map<string, number>();
        for (const log of logs) {
            const json = log.toJSON();
            const entry = new Date(json.entryTime);
            const dateStr = toDateStr(entry);
            const key = `${json.userId}::${dateStr}`;
            if (seenUserDay.has(key)) continue;
            seenUserDay.add(key);
            countByDate.set(dateStr, (countByDate.get(dateStr) ?? 0) + 1);
        }

        // Current week (7 entries, Mon–Sun)
        const currentWeek: GetAccessStatsUseCase.DayCount[] = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(monday);
            day.setDate(monday.getDate() + i);
            const dateStr = toDateStr(day);
            currentWeek.push({ date: dateStr, count: countByDate.get(dateStr) ?? 0 });
        }

        // Current month (all days; null for future)
        const curMonthDays = new Date(curYear, curMonth + 1, 0).getDate();
        const currentMonth: GetAccessStatsUseCase.NullableDayCount[] = [];
        for (let d = 1; d <= curMonthDays; d++) {
            const dateStr = toDateStr(new Date(curYear, curMonth, d));
            currentMonth.push({
                date: dateStr,
                count: dateStr > todayStr ? null : (countByDate.get(dateStr) ?? 0),
            });
        }

        // Previous month (all days)
        const prevYear = prevMonthStart.getFullYear();
        const prevMonth = prevMonthStart.getMonth();
        const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();
        const previousMonth: GetAccessStatsUseCase.DayCount[] = [];
        for (let d = 1; d <= prevMonthDays; d++) {
            const dateStr = toDateStr(new Date(prevYear, prevMonth, d));
            previousMonth.push({ date: dateStr, count: countByDate.get(dateStr) ?? 0 });
        }

        // Weekday averages for current month (past days only), order Mon–Sun
        const wdSums = [0, 0, 0, 0, 0, 0, 0];
        const wdCounts = [0, 0, 0, 0, 0, 0, 0];
        for (const entry of currentMonth) {
            if (entry.count === null) continue;
            const jsDay = new Date(entry.date + 'T12:00:00').getDay(); // 0=Sun
            const isoIdx = (jsDay + 6) % 7; // 0=Mon…6=Sun
            wdSums[isoIdx] += entry.count;
            wdCounts[isoIdx]++;
        }
        const WEEKDAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        const weekdayAverages: GetAccessStatsUseCase.WeekdayAverage[] = WEEKDAY_NAMES.map(
            (weekday, i) => ({
                weekday,
                average: wdCounts[i] > 0 ? Math.round((wdSums[i] / wdCounts[i]) * 10) / 10 : 0,
            })
        );

        // Totals
        const thisWeek = currentWeek.reduce((s, d) => s + d.count, 0);
        const thisMonth = currentMonth.reduce((s, d) => s + (d.count ?? 0), 0);
        const previousMonthTotal = previousMonth.reduce((s, d) => s + d.count, 0);

        const pastDays = currentMonth.filter(d => d.count !== null).length;
        const dailyAverageThisMonth = pastDays > 0
            ? Math.round((thisMonth / pastDays) * 10) / 10
            : 0;

        const prevDailyAvg = prevMonthDays > 0 ? previousMonthTotal / prevMonthDays : 0;
        const changePercentVsDailyAvg = prevDailyAvg > 0
            ? Math.round(((dailyAverageThisMonth - prevDailyAvg) / prevDailyAvg) * 1000) / 10
            : null;

        // Current year — monthly totals (Jan–Dec, 0 for future months)
        const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const currentYearMonthly: GetAccessStatsUseCase.MonthCount[] = MONTH_LABELS.map((label, i) => {
            const monthStart = new Date(curYear, i, 1);
            if (monthStart > today) return { month: i + 1, label, total: 0, isFuture: true };

            const daysInMonth = new Date(curYear, i + 1, 0).getDate();
            let total = 0;
            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = toDateStr(new Date(curYear, i, d));
                total += countByDate.get(dateStr) ?? 0;
            }
            return { month: i + 1, label, total, isFuture: false };
        });

        return {
            currentWeek,
            currentMonth,
            previousMonth,
            weekdayAverages,
            currentYearMonthly,
            totals: {
                thisWeek,
                thisMonth,
                previousMonthTotal,
                dailyAverageThisMonth,
                changePercentVsDailyAvg,
            },
        };
    }
}

namespace GetAccessStatsUseCase {
    export const DayCountSchema = z.object({ date: z.string(), count: z.number() });
    export const NullableDayCountSchema = z.object({ date: z.string(), count: z.number().nullable() });
    export const WeekdayAverageSchema = z.object({ weekday: z.string(), average: z.number() });
    export const TotalsSchema = z.object({
        thisWeek: z.number(),
        thisMonth: z.number(),
        previousMonthTotal: z.number(),
        dailyAverageThisMonth: z.number(),
        changePercentVsDailyAvg: z.number().nullable(),
    });

    export const MonthCountSchema = z.object({
        month: z.number(),
        label: z.string(),
        total: z.number(),
        isFuture: z.boolean(),
    });

    export const InputSchema = z.object({});
    export const OutputSchema = z.object({
        currentWeek: z.array(DayCountSchema),
        currentMonth: z.array(NullableDayCountSchema),
        previousMonth: z.array(DayCountSchema),
        weekdayAverages: z.array(WeekdayAverageSchema),
        currentYearMonthly: z.array(MonthCountSchema),
        totals: TotalsSchema,
    });

    export type DayCount = z.infer<typeof DayCountSchema>;
    export type NullableDayCount = z.infer<typeof NullableDayCountSchema>;
    export type WeekdayAverage = z.infer<typeof WeekdayAverageSchema>;
    export type MonthCount = z.infer<typeof MonthCountSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { GetAccessStatsUseCase };
