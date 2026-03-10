import { createRoomRoute } from "./routes/create-room";
import { listRoomsRoute } from "./routes/list-rooms";
import { updateRoomRoute } from "./routes/update-room";
import { deleteRoomRoute } from "./routes/delete-room";
import { setRoomEnabledRoute } from "./routes/set-room-enabled";
import { requestBookingRoute } from "./routes/request-booking";
import { processBookingRequestRoute } from "./routes/process-booking-request";
import { cancelBookingRoute } from "./routes/cancel-booking";
import { adminCancelBookingRoute } from "./routes/admin-cancel-booking";
import { findBookingsRoute } from "./routes/find-bookings";
import { findMyBookingsRoute } from "./routes/find-my-bookings";
import { listAvailableSlotsByDayRoute } from "./routes/list-available-slots-by-day";
import { sendBookingRemindersOfTomorrowRoute } from "./routes/send-booking-reminders-of-tomorrow";
import { setDefaultOperatingScheduleRoute } from "./routes/set-default-operating-schedule";
import { addOperatingHoursOverrideRoute } from "./routes/add-operating-hours-override";

export const bookingRouter = {
    createRoom: createRoomRoute,
    listRooms: listRoomsRoute,
    updateRoom: updateRoomRoute,
    deleteRoom: deleteRoomRoute,
    setRoomEnabled: setRoomEnabledRoute,
    requestBooking: requestBookingRoute,
    processBookingRequest: processBookingRequestRoute,
    /*
    */
    cancelBooking: cancelBookingRoute,
    adminCancelBooking: adminCancelBookingRoute,
    findBookings: findBookingsRoute,
    findMyBookings: findMyBookingsRoute,
    listAvailableSlotsByDay: listAvailableSlotsByDayRoute,
    sendBookingRemindersOfTomorrow: sendBookingRemindersOfTomorrowRoute,
    setDefaultOperatingSchedule: setDefaultOperatingScheduleRoute,
    addOperatingHoursOverride: addOperatingHoursOverrideRoute,
};
