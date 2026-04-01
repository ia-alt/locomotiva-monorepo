import { systemRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { SendBookingRemindersOfTomorrowUseCase } from "@booking/application/use-cases/send-booking-reminders-of-tomorrow";

export const sendBookingRemindersOfTomorrowRoute = systemRoute
    .route({ method: "POST", path: "/bookings/send-reminders-of-tomorrow" })
    .input(SendBookingRemindersOfTomorrowUseCase.InputSchema)
    .output(SendBookingRemindersOfTomorrowUseCase.OutputSchema)
    .handler(async () => {
        return orpcSafe(async () => {
            const sendBookingRemindersOfTomorrowUseCase = container.getSendBookingRemindersOfTomorrowUseCase();
            return sendBookingRemindersOfTomorrowUseCase.execute();
        })
    });
