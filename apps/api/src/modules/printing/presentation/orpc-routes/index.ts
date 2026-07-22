import { requestPrintRoute } from "./routes/request-print";
import { createPrintFileDownloadUrlRoute } from "./routes/create-print-file-download-url";
import { cancelPrintRequestRoute } from "./routes/cancel-print-request";
import { findMyPrintRequestsRoute } from "./routes/find-my-print-requests";
import { getPrintRequestByIdRoute } from "./routes/get-print-request-by-id";
import { processPrintRequestRoute } from "./routes/process-print-request";
import { allocatePrinterRoute } from "./routes/allocate-printer";
import { startPrintProductionRoute } from "./routes/start-print-production";
import { completePrintRequestRoute } from "./routes/complete-print-request";
import { deliverPrintRequestRoute } from "./routes/deliver-print-request";
import { discardPrintRequestRoute } from "./routes/discard-print-request";
import { adminCancelPrintRequestRoute } from "./routes/admin-cancel-print-request";
import { findPrintRequestsAdminRoute } from "./routes/find-print-requests-admin";
import { listPrintersRoute } from "./routes/list-printers";
import { getPrinterByIdRoute } from "./routes/get-printer-by-id";
import { createPrinterRoute } from "./routes/create-printer";
import { updatePrinterRoute } from "./routes/update-printer";
import { setPrinterEnabledRoute } from "./routes/set-printer-enabled";
import { deletePrinterRoute } from "./routes/delete-printer";
import { listFilamentsRoute } from "./routes/list-filaments";
import { createFilamentRoute } from "./routes/create-filament";
import { deleteFilamentRoute } from "./routes/delete-filament";

export const printingRouter = {
    // Pedidos de impressão (cliente)
    requestPrint: requestPrintRoute,
    createPrintFileDownloadUrl: createPrintFileDownloadUrlRoute,
    cancelPrintRequest: cancelPrintRequestRoute,
    findMyPrintRequests: findMyPrintRequestsRoute,
    getPrintRequestById: getPrintRequestByIdRoute,
    // Pedidos de impressão (admin/técnico)
    processPrintRequest: processPrintRequestRoute,
    allocatePrinter: allocatePrinterRoute,
    startPrintProduction: startPrintProductionRoute,
    completePrintRequest: completePrintRequestRoute,
    deliverPrintRequest: deliverPrintRequestRoute,
    discardPrintRequest: discardPrintRequestRoute,
    adminCancelPrintRequest: adminCancelPrintRequestRoute,
    findPrintRequestsAdmin: findPrintRequestsAdminRoute,
    // Impressoras
    listPrinters: listPrintersRoute,
    getPrinterById: getPrinterByIdRoute,
    createPrinter: createPrinterRoute,
    updatePrinter: updatePrinterRoute,
    setPrinterEnabled: setPrinterEnabledRoute,
    deletePrinter: deletePrinterRoute,
    // Filamentos (catálogo de materiais)
    listFilaments: listFilamentsRoute,
    createFilament: createFilamentRoute,
    deleteFilament: deleteFilamentRoute,
};
