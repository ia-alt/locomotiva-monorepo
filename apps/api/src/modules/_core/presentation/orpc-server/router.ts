import { identyRoutes } from "src/modules/identity/presentation/orpc-routes";
import { coworkingRoutes } from "@coworking/presentation/orpc-routes";
import { bookingRouter } from "@booking/presentation/orpc-routes";
import { reportRoutes } from "@report/presentation/orpc-routes";
import { printingRouter } from "@printing/presentation/orpc-routes";
import { RouterClient } from "@orpc/server";



export const router = {
    identy: identyRoutes,
    coworking: coworkingRoutes,
    booking: bookingRouter,
    report: reportRoutes,
    printing: printingRouter,
}

export type RouterClientType = RouterClient<typeof router>