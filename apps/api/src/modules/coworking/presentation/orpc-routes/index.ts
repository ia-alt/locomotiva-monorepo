import { performCheckinRoute } from "./routes/checkin";
import { performCheckoutRoute } from "./routes/checkout";
import { adminPerformCheckinRoute } from "./routes/admin-checkin";
import { adminPerformCheckoutRoute } from "./routes/admin-checkout";
import { autoCheckoutAllRoute } from "./routes/auto-checkout-all";
import { listUserAccessLogsRoute } from "./routes/list-user-access-logs";
import { listAllAccessLogsRoute } from "./routes/list-all-access-logs";
import { configureCoworkingRoute } from "./routes/configure-coworking";
import { countActiveAccessLogsRoute } from "./routes/count-active-access-logs";
import { getMyCheckinStatusRoute } from "./routes/get-my-checkin-status";
import { listActiveSessionsRoute } from "./routes/list-active-sessions";
import { getWeeklyFrequencyRoute } from "./routes/get-weekly-frequency";
import { getAccessStatsRoute } from "./routes/get-access-stats";
import { getYearlyReportRoute } from "./routes/get-yearly-report";
import { getRecentActivitiesRoute } from "./routes/get-recent-activities";
import { onTotemCheckinRoute } from "./routes/on-totem-checkin";
import { checkinByCpfRoute } from "./routes/checkin-by-cpf";
import { checkoutByCpfRoute } from "./routes/checkout-by-cpf";
import { findMemberByCpfRoute } from "./routes/find-member-by-cpf";
import { findActiveMemberByCpfRoute } from "./routes/find-active-member-by-cpf";
import { quickCheckoutByCpfRoute } from "./routes/quick-checkout-by-cpf";
import { generateTotemAccessCodeRoute } from "./routes/generate-totem-access-code";
import { listAccessLogsByDayRoute } from "./routes/list-access-logs-by-day";

export const coworkingRoutes = {
    checkin: performCheckinRoute,
    checkout: performCheckoutRoute,
    adminCheckin: adminPerformCheckinRoute,
    adminCheckout: adminPerformCheckoutRoute,
    autoCheckoutAll: autoCheckoutAllRoute,
    listUserAccessLogs: listUserAccessLogsRoute,
    listAllAccessLogs: listAllAccessLogsRoute,
    configure: configureCoworkingRoute,
    countActiveAccessLogs: countActiveAccessLogsRoute,
    getMyCheckinStatus: getMyCheckinStatusRoute,
    listActiveSessions: listActiveSessionsRoute,
    getWeeklyFrequency: getWeeklyFrequencyRoute,
    getAccessStats: getAccessStatsRoute,
    getYearlyReport: getYearlyReportRoute,
    getRecentActivities: getRecentActivitiesRoute,
    totem: {
        onCheckin: onTotemCheckinRoute,
        generateAccessCode: generateTotemAccessCodeRoute,
    },
    checkinByCpf: checkinByCpfRoute,
    checkoutByCpf: checkoutByCpfRoute,
    findMemberByCpf: findMemberByCpfRoute,
    findActiveMemberByCpf: findActiveMemberByCpfRoute,
    quickCheckoutByCpf: quickCheckoutByCpfRoute,
    listAccessLogsByDay: listAccessLogsByDayRoute,
};

