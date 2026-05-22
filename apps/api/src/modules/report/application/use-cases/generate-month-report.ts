import { UseCase } from "@core/base-classes";
import { AuthUserService } from "src/modules/identity/domain/services";
import { ReportService } from "../../domain/services/report";
import { MonthReport } from "../../domain/value-objects/month-report";
import { OnlyDate } from "@core/value-objects";
import z from "zod";

class GenerateMonthReportUseCase implements UseCase<GenerateMonthReportUseCase.Input, GenerateMonthReportUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly reportService: ReportService,
    ) { }

    async execute(input: GenerateMonthReportUseCase.Input): Promise<GenerateMonthReportUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const date = new OnlyDate(input.date);
        const report = await this.reportService.generateMonthReport(date.getYear(), date.getMonth());
        return report.toJSON();
    }
}

namespace GenerateMonthReportUseCase {
    export const InputSchema = z.object({
        date: OnlyDate.ValueSchema,
    });

    export const OutputSchema = MonthReport.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { GenerateMonthReportUseCase };
