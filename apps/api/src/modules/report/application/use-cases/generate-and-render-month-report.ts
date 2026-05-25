import { UseCase } from "@core/base-classes";
import { AuthUserService } from "src/modules/identity/domain/services";
import { ReportService } from "../../domain/services/report";
import { RenderReportService } from "../../domain/services/render-report";
import { OnlyDate } from "@core/value-objects";
import z from "zod";

class GenerateAndRenderMonthReportUseCase implements UseCase<GenerateAndRenderMonthReportUseCase.Input, GenerateAndRenderMonthReportUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly reportService: ReportService,
        private readonly renderReportService: RenderReportService,
    ) { }

    async execute(input: GenerateAndRenderMonthReportUseCase.Input): Promise<GenerateAndRenderMonthReportUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const date = new OnlyDate(input.date);
        const report = await this.reportService.generateMonthReport(date.getYear(), date.getMonth());
        const pdfBuffer = await this.renderReportService.renderMonthReport(report);
        return pdfBuffer;
    }
}

namespace GenerateAndRenderMonthReportUseCase {
    export const InputSchema = z.object({
        date: OnlyDate.ValueSchema,
    });

    export const OutputSchema = z.instanceof(Blob);

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { GenerateAndRenderMonthReportUseCase };
