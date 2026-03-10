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
};
