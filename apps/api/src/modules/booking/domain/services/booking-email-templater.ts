export type BookingEmailParams = {
    userName: string;
    roomName: string;
    day: string;
    hourFrom: string;
    hourTo: string;
    title: string;
};

export interface BookingEmailTemplater {
    templateForCreatedBooking(params: BookingEmailParams): Promise<string>;
    templateForConfirmedBooking(params: BookingEmailParams): Promise<string>;
    templateForRejectedBooking(params: BookingEmailParams, reason?: string): Promise<string>;
    templateForCancelledBooking(params: BookingEmailParams): Promise<string>;
}
