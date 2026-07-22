export type PrintRequestEmailParams = {
    userName: string;
    purpose: string;
    material: string;
    stlFileName: string;
    gcodeFileName: string;
};

export interface PrintRequestEmailTemplater {
    templateForCreated(params: PrintRequestEmailParams): Promise<string>;
    templateForAdminNew(params: PrintRequestEmailParams, requestUrl: string): Promise<string>;
    templateForApproved(params: PrintRequestEmailParams): Promise<string>;
    templateForRejected(params: PrintRequestEmailParams, reason?: string): Promise<string>;
    templateForCancelled(params: PrintRequestEmailParams): Promise<string>;
    templateForCompleted(params: PrintRequestEmailParams): Promise<string>;
}
