import z from "zod";

export const DayOfWeekSchema = z.enum([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]);

export type DayOfWeek = z.infer<typeof DayOfWeekSchema>;