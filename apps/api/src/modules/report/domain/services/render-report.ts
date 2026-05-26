import { MonthReport } from "../value-objects/month-report";

export interface RenderReportService {
    renderMonthReport(report: MonthReport): Promise<Blob>;
}
