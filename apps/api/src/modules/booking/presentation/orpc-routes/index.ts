import { createRoomRoute } from "./routes/create-room";
import { listRoomsRoute } from "./routes/list-rooms";
import { getRoomByIdRoute } from "./routes/get-room-by-id";
import { updateRoomRoute } from "./routes/update-room";
import { deleteRoomRoute } from "./routes/delete-room";
import { setRoomEnabledRoute } from "./routes/set-room-enabled";
import { requestBookingRoute } from "./routes/request-booking";
import { processBookingRequestRoute } from "./routes/process-booking-request";
import { cancelBookingRoute } from "./routes/cancel-booking";
import { adminCancelBookingRoute } from "./routes/admin-cancel-booking";
import { findBookingsRoute } from "./routes/find-bookings";
import { findMyBookingsRoute } from "./routes/find-my-bookings";
import { getBookingByIdRoute } from "./routes/get-booking-by-id";
import { listAvailableSlotsByDayRoute } from "./routes/list-available-slots-by-day";
import { sendBookingRemindersOfTomorrowRoute } from "./routes/send-booking-reminders-of-tomorrow";
import { setDefaultOperatingScheduleRoute } from "./routes/set-default-operating-schedule";
import { addOperatingHoursOverrideRoute } from "./routes/add-operating-hours-override";
import { getRoomOperatingScheduleRoute } from "./routes/get-room-operating-schedule";
import { getGlobalBlockedDatesRoute } from "./routes/get-global-blocked-dates";
import { setGlobalBlockedDatesRoute } from "./routes/set-global-blocked-dates";
import { findBookingsAdminRoute } from "./routes/find-bookings-admin";
import { adminCreateBookingRoute } from "./routes/admin-create-booking";
import { markBookingNoShowRoute } from "./routes/mark-booking-no-show";

export const bookingRouter = {
    createRoom: createRoomRoute,
    listRooms: listRoomsRoute,
    getRoomById: getRoomByIdRoute,
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
    getBookingById: getBookingByIdRoute,
    listAvailableSlotsByDay: listAvailableSlotsByDayRoute,
    sendBookingRemindersOfTomorrow: sendBookingRemindersOfTomorrowRoute,
    setDefaultOperatingSchedule: setDefaultOperatingScheduleRoute,
    addOperatingHoursOverride: addOperatingHoursOverrideRoute,
    getRoomOperatingSchedule: getRoomOperatingScheduleRoute,
    getGlobalBlockedDates: getGlobalBlockedDatesRoute,
    setGlobalBlockedDates: setGlobalBlockedDatesRoute,
    findBookingsAdmin: findBookingsAdminRoute,
    adminCreateBooking: adminCreateBookingRoute,
    markBookingNoShow: markBookingNoShowRoute,
};
