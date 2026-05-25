import { BookingService } from "src/modules/booking/domain/services/booking";
import { AccessLogService } from "src/modules/coworking/domain/services/access-log";
import { MonthReport } from "../value-objects/month-report";

class ReportService {
    constructor(
        private readonly bookingService: BookingService,
        private readonly accessLogService: AccessLogService,
    ) { }

    async generateMonthReport(year: number, month: number): Promise<MonthReport> {
        const [bookings, coworkingLogs] = await Promise.all([
            this.bookingService.findAllByMonthWithUsers(year, month),
            this.accessLogService.findAllByMonthWithUsers(year, month),
        ]);

        return new MonthReport({ year, month, bookings, coworkingLogs });
    }
}

export { ReportService };
