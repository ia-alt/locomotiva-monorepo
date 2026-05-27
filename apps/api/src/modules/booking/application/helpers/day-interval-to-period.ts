import { DatePeriod, OnlyDate } from "@core/value-objects";
import { TimeInterval } from "@operating-hours/domain/value-objects";

const COMPANY_UTC_OFFSET = "-03:00";

function pad(n: number): string {
    return n.toString().padStart(2, "0");
}


export function dayAndIntervalToPeriod(day: OnlyDate, interval: TimeInterval): DatePeriod {
    const dayStr = day.toString(); // YYYY-MM-DD
    const start = interval.value.start;
    const end = interval.value.end;

    const from = new Date(
        `${dayStr}T${pad(start.getHour())}:${pad(start.getMinute())}:${pad(start.getSecond())}${COMPANY_UTC_OFFSET}`,
    );
    const to = new Date(
        `${dayStr}T${pad(end.getHour())}:${pad(end.getMinute())}:${pad(end.getSecond())}${COMPANY_UTC_OFFSET}`,
    );

    return new DatePeriod({ from, to });
}
