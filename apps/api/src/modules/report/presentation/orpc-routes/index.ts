import { generateMonthReportRoute } from "./routes/generate-month-report";
import { generateAndRenderMonthReportRoute } from "./routes/generate-and-render-month-report";

export const reportRoutes = {
    generateMonthReport: generateMonthReportRoute,
    generateAndRenderMonthReport: generateAndRenderMonthReportRoute,
};
