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

const MONTH_NAMES_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEKDAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

class GetYearlyReportUseCase implements UseCase<GetYearlyReportUseCase.Input, GetYearlyReportUseCase.Output> {
    constructor(
        private readonly accessLogRepository: AccessLogRepository,
        private readonly authUserService: AuthUserService,
    ) { }

    async execute(input: GetYearlyReportUseCase.Input): Promise<GetYearlyReportUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const { year } = input;
        const today = new Date();
        const isCurrentYear = year === today.getFullYear();

        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year + 1, 0, 1); // exclusive

        const logs = await this.accessLogRepository.findEntriesInRange(yearStart, yearEnd);

        const countByDate = new Map<string, number>();
        for (const log of logs) {
            const dateStr = toDateStr(new Date(log.toJSON().entryTime));
            countByDate.set(dateStr, (countByDate.get(dateStr) ?? 0) + 1);
        }

        const months: GetYearlyReportUseCase.MonthData[] = [];
        let yearTotal = 0;
        let totalPastDays = 0;

        for (let m = 0; m < 12; m++) {
            const monthStart = new Date(year, m, 1);
            if (isCurrentYear && monthStart > today) break; // skip future months

            const daysInMonth = new Date(year, m + 1, 0).getDate();
            const lastDay = isCurrentYear && m === today.getMonth() ? today.getDate() : daysInMonth;

            let monthTotal = 0;
            let peakCount = 0;
            let peakDate: string | null = null;

            const wdSums = [0, 0, 0, 0, 0, 0, 0];
            const wdCounts = [0, 0, 0, 0, 0, 0, 0];

            for (let d = 1; d <= lastDay; d++) {
                const date = new Date(year, m, d);
                const dateStr = toDateStr(date);
                const count = countByDate.get(dateStr) ?? 0;
                monthTotal += count;

                if (count > peakCount) {
                    peakCount = count;
                    peakDate = `${String(d).padStart(2, '0')}/${String(m + 1).padStart(2, '0')}`;
                }

                const isoIdx = (date.getDay() + 6) % 7; // 0=Mon
                wdSums[isoIdx] += count;
                wdCounts[isoIdx]++;
            }

            const weekdayAverages = WEEKDAY_NAMES.map((weekday, i) => ({
                weekday,
                average: wdCounts[i] > 0 ? Math.round((wdSums[i] / wdCounts[i]) * 10) / 10 : 0,
                total: wdSums[i],
            }));

            const busiestWd = weekdayAverages.reduce(
                (best, cur) => cur.average > best.average ? cur : best,
                weekdayAverages[0]
            );

            yearTotal += monthTotal;
            totalPastDays += lastDay;

            months.push({
                month: m + 1,
                monthName: MONTH_NAMES_PT[m],
                total: monthTotal,
                dailyAverage: lastDay > 0 ? Math.round((monthTotal / lastDay) * 10) / 10 : 0,
                peakCount,
                peakDate,
                busiestWeekday: busiestWd.average > 0 ? busiestWd.weekday : null,
                weekdayAverages,
            });
        }

        // Yearly weekday averages
        const yrWdSums = [0, 0, 0, 0, 0, 0, 0];
        const yrWdCounts = [0, 0, 0, 0, 0, 0, 0];
        for (const [dateStr, count] of countByDate) {
            const isoIdx = (new Date(dateStr + 'T12:00:00').getDay() + 6) % 7;
            yrWdSums[isoIdx] += count;
            yrWdCounts[isoIdx]++;
        }
        const weekdayAveragesYearly = WEEKDAY_NAMES.map((weekday, i) => ({
            weekday,
            average: yrWdCounts[i] > 0 ? Math.round((yrWdSums[i] / yrWdCounts[i]) * 10) / 10 : 0,
        }));

        const yearDailyAverage = totalPastDays > 0 ? Math.round((yearTotal / totalPastDays) * 10) / 10 : 0;
        const bestMonth = months.length > 0
            ? months.reduce((best, cur) => cur.total > best.total ? cur : best)
            : null;
        const busiestWeekday = weekdayAveragesYearly.length > 0
            ? weekdayAveragesYearly.reduce((best, cur) => cur.average > best.average ? cur : best)
            : null;

        return {
            year,
            yearTotal,
            yearDailyAverage,
            bestMonth: bestMonth ? { month: bestMonth.month, monthName: bestMonth.monthName, total: bestMonth.total } : null,
            busiestWeekday,
            months,
            weekdayAveragesYearly,
        };
    }
}

namespace GetYearlyReportUseCase {
    const WeekdayAvgSchema = z.object({ weekday: z.string(), average: z.number(), total: z.number().optional() });

    export const MonthDataSchema = z.object({
        month: z.number(),
        monthName: z.string(),
        total: z.number(),
        dailyAverage: z.number(),
        peakCount: z.number(),
        peakDate: z.string().nullable(),
        busiestWeekday: z.string().nullable(),
        weekdayAverages: z.array(WeekdayAvgSchema),
    });

    export const InputSchema = z.object({ year: z.number().int().min(2020).max(2100) });

    export const OutputSchema = z.object({
        year: z.number(),
        yearTotal: z.number(),
        yearDailyAverage: z.number(),
        bestMonth: z.object({ month: z.number(), monthName: z.string(), total: z.number() }).nullable(),
        busiestWeekday: WeekdayAvgSchema.nullable(),
        months: z.array(MonthDataSchema),
        weekdayAveragesYearly: z.array(WeekdayAvgSchema),
    });

    export type MonthData = z.infer<typeof MonthDataSchema>;
    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { GetYearlyReportUseCase };
