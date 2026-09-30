import { BookingService } from "src/modules/booking/domain/services/booking";
import { AccessLogService } from "src/modules/coworking/domain/services/access-log";
import { PrintRequestService } from "@printing/domain/services";
import { MonthReport } from "../value-objects/month-report";

class ReportService {
    constructor(
        private readonly bookingService: BookingService,
        private readonly accessLogService: AccessLogService,
        private readonly printRequestService: PrintRequestService,
    ) { }

    async generateMonthReport(year: number, month: number): Promise<MonthReport> {
        const [bookings, coworkingLogs, printRequests] = await Promise.all([
            this.bookingService.findAllByMonthWithUsers(year, month),
            this.accessLogService.findAllByMonthWithUsers(year, month),
            this.printRequestService.findAllByMonthWithDetails(year, month),
        ]);

        return new MonthReport({ year, month, bookings, coworkingLogs, printRequests });
    }
}

export { ReportService };
