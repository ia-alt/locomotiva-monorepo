import { BcryptPasswordHashService, JwtAuthTokenService, JwtPasswordResetTokenService, OpenIdGovbrOidcService, TemplateStringPasswordResetEmailTemplater } from "src/modules/identity/infra/services";
import { TemplateStringPasswordResetCodeEmailTemplater } from "src/modules/identity/infra/services/template-string-password-reset-code-email-templater";
import { TemplateStringWelcomeEmailTemplater } from "src/modules/identity/infra/services/template-string-welcome-email-templater";
import { AfterPasswordResetCodeRequested } from "src/modules/identity/application/subscribers/after-password-reset-code-requested";
import { AfterUserRegistered } from "src/modules/identity/application/subscribers/after-user-registered";
import { PasswordResetCodeEmailTemplater } from "src/modules/identity/domain/services/password-reset-code-email-templater";
import { WelcomeEmailTemplater } from "src/modules/identity/domain/services/welcome-email-templater";
import { PrismaUserRepository, PrismaApiKeyRepository, PrismaGovbrAuthRequestRepository, PrismaGovbrPendingIdentityRepository } from "src/modules/identity/infra/repositories";
import { UserRepository, ApiKeyRepository, GovbrAuthRequestRepository, GovbrPendingIdentityRepository } from "src/modules/identity/domain/repositories";
import { PrismaClient } from "@core/infra/database/prisma";
import { prisma } from "@core/infra/database/prisma/prisma-instance";
import { RegisterUserUseCase } from "src/modules/identity/application/use-cases/register-user";
import { StartGovbrLoginUseCase } from "src/modules/identity/application/use-cases/start-govbr-login";
import { CompleteGovbrLoginUseCase } from "src/modules/identity/application/use-cases/complete-govbr-login";
import { LinkGovbrToAccountUseCase } from "src/modules/identity/application/use-cases/link-govbr-to-account";
import { CompleteGovbrRegistrationUseCase } from "src/modules/identity/application/use-cases/complete-govbr-registration";
import { CreateApiKeyUseCase } from "src/modules/identity/application/use-cases/create-api-key";
import { ListApiKeysUseCase } from "src/modules/identity/application/use-cases/list-api-keys";
import { RevokeApiKeyUseCase } from "src/modules/identity/application/use-cases/revoke-api-key";
import { CoworkingSettingsRepository, AccessLogRepository } from "@coworking/domain/repositories";
import { PrismaCoworkingSettingsRepository } from "@coworking/infra/repositories/prisma-coworking-settings";
import { PrismaAccessLogRepository } from "@coworking/infra/repositories/prisma-access-log";
import { SpaceOperatingHoursRepository } from "@operating-hours/domain/repositories/space-operating-hours";
import { PrismaSpaceOperatingHoursRepository } from "@operating-hours/infra/repositories/prisma-space-operating-hours";
import { SpaceOperatingHoursService } from "@operating-hours/domain/services";
import { BookingRepository, RoomRepository, CalendarRepository } from "@booking/domain/repositories";
import { PrismaBookingRepository } from "@booking/infra/repositories/prisma-booking";
import { PrismaRoomRepository } from "@booking/infra/repositories/prisma-room";
import { PrismaCalendarRepository } from "@booking/infra/repositories/prisma-calendar";
import { BookingService, BookingEmailTemplater, CalendarService } from "@booking/domain/services";
import { TemplateStringBookingEmailTemplater, GoogleCalendarService } from "@booking/infra/services";
import { BookingReminderEmailTemplater } from "@booking/application/services";
import { TemplateStringBookingReminderEmailTemplater } from "@booking/infra/services/template-string-booking-reminder-email-templater";
import { GetAuthUserUseCase } from "src/modules/identity/application/use-cases/get-auth-user";
import { User, ApiKey } from "src/modules/identity/domain/entities";
import { AuthService, AuthTokenService, AuthUserService, AuthApiKeyService, GovbrOidcService, PasswordHashService, PasswordResetTokenService, PasswordService } from "src/modules/identity/domain/services";
import { LoginUseCase } from "src/modules/identity/application/use-cases/login";
import { RequestPasswordResetUseCase } from "src/modules/identity/application/use-cases/request-password-reset";
import { ChangePasswordUseCase } from "src/modules/identity/application/use-cases/change-password";
import { ExecutePasswordResetUseCase } from "src/modules/identity/application/use-cases/execute-password-reset";
import { RequestPasswordResetCodeUseCase } from "src/modules/identity/application/use-cases/request-password-reset-code";
import { VerifyPasswordResetCodeUseCase } from "src/modules/identity/application/use-cases/verify-password-reset-code";
import { ExecutePasswordResetWithCodeUseCase } from "src/modules/identity/application/use-cases/execute-password-reset-with-code";
import { ListUsersUseCase } from "src/modules/identity/application/use-cases/list-users";
import { UpdateUserUseCase } from "src/modules/identity/application/use-cases/update-user";
import { UpdateMeUseCase } from "src/modules/identity/application/use-cases/update-me";
import { DeleteUserUseCase } from "src/modules/identity/application/use-cases/delete-user";
import { SendEmailService } from "@notifications/application/services";
import { ConsoleSendEmailService } from "@notifications/infra/services/console-send-email";
import { NodemailerSendEmailService } from "@notifications/infra/services/resend-send-email";
import { env } from "src/modules/env";
import { PerformCheckinUseCase, PerformCheckoutUseCase, ListUserAccessLogsUseCase, ListAllAccessLogsUseCase, AutoCheckoutAllUseCase, ConfigureCoworkingUseCase, AdminPerformCheckinUseCase, AdminPerformCheckoutUseCase, CountActiveAccessLogsUseCase, GetMyCheckinStatusUseCase, CheckinByCpfUseCase, CheckoutByCpfUseCase, FindMemberByCpfUseCase, FindActiveMemberByCpfUseCase, QuickCheckoutByCpfUseCase, GenerateTotemAccessCodeUseCase, ListAccessLogsByDayUseCase } from "@coworking/application/use-cases";
import { CreateRoomUseCase } from "@booking/application/use-cases/create-room";
import { ListRoomsUseCase } from "@booking/application/use-cases/list-rooms";
import { GetRoomByIdUseCase } from "@booking/application/use-cases/get-room-by-id";
import { UpdateRoomUseCase } from "@booking/application/use-cases/update-room";
import { DeleteRoomUseCase } from "@booking/application/use-cases/delete-room";
import { SetRoomEnabledUseCase } from "@booking/application/use-cases/set-room-enabled";
import { RequestBookingUseCase } from "@booking/application/use-cases/request-booking";
import { ProcessBookingRequestUseCase } from "@booking/application/use-cases/process-booking-request";
import { CancelBookingUseCase } from "@booking/application/use-cases/cancel-booking";
import { AdminCancelBookingUseCase } from "@booking/application/use-cases/admin-cancel-booking";
import { FindBookingsUseCase } from "@booking/application/use-cases/find-bookings";
import { FindMyBookingsUseCase } from "@booking/application/use-cases/find-my-bookings";
import { FindBookingsAdminUseCase } from "@booking/application/use-cases/find-bookings-admin";
import { AdminCreateBookingUseCase } from "@booking/application/use-cases/admin-create-booking";
import { GetBookingByIdUseCase } from "@booking/application/use-cases/get-booking-by-id";
import { MarkBookingNoShowUseCase } from "@booking/application/use-cases/mark-booking-no-show";
import { UpdateBookingNumberOfPeopleUseCase } from "@booking/application/use-cases/update-booking-number-of-people";
import { ListAvailableSlotsByDayUseCase } from "@booking/application/use-cases/list-available-slots-by-day";
import { SendBookingRemindersOfTomorrowUseCase } from "@booking/application/use-cases/send-booking-reminders-of-tomorrow";
import { SetDefaultOperatingScheduleUseCase } from "@booking/application/use-cases/set-room-default-operating-hours";
import { AddOperatingHoursOverrideUseCase } from "@booking/application/use-cases/add-room-operating-hours-override";
import { GetRoomOperatingScheduleUseCase } from "@booking/application/use-cases/get-room-operating-schedule";
import { GetGlobalBlockedDatesUseCase } from "@booking/application/use-cases/get-global-blocked-dates";
import { SetGlobalBlockedDatesUseCase } from "@booking/application/use-cases/set-global-blocked-dates";
import { ListActiveSessionsUseCase } from "@coworking/application/use-cases/list-active-sessions";
import { GetWeeklyFrequencyUseCase } from "@coworking/application/use-cases/get-weekly-frequency";
import { GetAccessStatsUseCase } from "@coworking/application/use-cases/get-access-stats";
import { GetYearlyReportUseCase } from "@coworking/application/use-cases/get-yearly-report";
import { GetRecentActivitiesUseCase } from "@coworking/application/use-cases/get-recent-activities";
import { AccessService, AccessLogService } from "@coworking/domain/services";
import { PasswordResetEmailTemplater } from "src/modules/identity/domain/services/password-reset-email-templater";
import { AfterPasswordResetRequested } from "src/modules/identity/application/subscribers/after-password-reset-requested";
import { AfterBookingStatusChanged } from "@booking/application/subscribers/after-booking-status-changed";
import { AfterUserCheckin } from "../coworking/application/subscribers/after-user-checkin";
import { TotemCheckinNotifier } from "../coworking/application/services/totem-checkin-notifier";
import { MemoryPublisherTotemCheckinNotifier } from "../coworking/infra/services/memory-publisher-totem-checkin-notifier";
import { TotemCheckinAccessCodeManager } from "../coworking/application/services/totem-checkin-access-code-manager";
import { MemoryTotemCheckinAccessCodeManager } from "../coworking/infra/services/memory-totem-checkin-access-code-manager";
import { ReportService } from "src/modules/report/domain/services/report";
import { RenderReportService } from "src/modules/report/domain/services/render-report";
import { ReactPdfRenderReportService } from "src/modules/report/infra/services/react-pdf-render-report";
import { GenerateMonthReportUseCase } from "src/modules/report/application/use-cases/generate-month-report";
import { GenerateAndRenderMonthReportUseCase } from "src/modules/report/application/use-cases/generate-and-render-month-report";
import { PrinterRepository, PrintRequestRepository, FilamentRepository } from "@printing/domain/repositories";
import { PrismaPrinterRepository } from "@printing/infra/repositories/prisma-printer";
import { PrismaPrintRequestRepository } from "@printing/infra/repositories/prisma-print-request";
import { PrismaFilamentRepository } from "@printing/infra/repositories/prisma-filament";
import { PrintRequestService, PrintRequestEmailTemplater } from "@printing/domain/services";
import { TemplateStringPrintRequestEmailTemplater } from "@printing/infra/services";
import { BucketStorageService, StoredFileService } from "@storage/domain/services";
import { StoredFileRepository } from "@storage/domain/repositories";
import { PrismaStoredFileRepository } from "@storage/infra/repositories";
import { SupabaseBucketStorageService } from "@storage/infra/services";
import { UploadFileUseCase } from "@storage/application/use-cases/upload-file";
import { AfterPrintRequestStatusChanged } from "@printing/application/subscribers/after-print-request-status-changed";
import { RequestPrintUseCase } from "@printing/application/use-cases/request-print";
import { CreatePrintFileDownloadUrlUseCase } from "@printing/application/use-cases/create-print-file-download-url";
import { CancelPrintRequestUseCase } from "@printing/application/use-cases/cancel-print-request";
import { FindMyPrintRequestsUseCase } from "@printing/application/use-cases/find-my-print-requests";
import { GetPrintRequestByIdUseCase } from "@printing/application/use-cases/get-print-request-by-id";
import { ProcessPrintRequestUseCase } from "@printing/application/use-cases/process-print-request";
import { AllocatePrinterUseCase } from "@printing/application/use-cases/allocate-printer";
import { DeliverPrintRequestUseCase } from "@printing/application/use-cases/deliver-print-request";
import { DiscardPrintRequestUseCase } from "@printing/application/use-cases/discard-print-request";
import { AdminCancelPrintRequestUseCase } from "@printing/application/use-cases/admin-cancel-print-request";
import { FindPrintRequestsAdminUseCase } from "@printing/application/use-cases/find-print-requests-admin";
import { ListPrintersUseCase } from "@printing/application/use-cases/list-printers";
import { StartPrintProductionUseCase } from "@printing/application/use-cases/start-print-production";
import { CompletePrintRequestUseCase } from "@printing/application/use-cases/complete-print-request";
import { GetPrinterByIdUseCase } from "@printing/application/use-cases/get-printer-by-id";
import { CreatePrinterUseCase } from "@printing/application/use-cases/create-printer";
import { UpdatePrinterUseCase } from "@printing/application/use-cases/update-printer";
import { SetPrinterEnabledUseCase } from "@printing/application/use-cases/set-printer-enabled";
import { DeletePrinterUseCase } from "@printing/application/use-cases/delete-printer";
import { ListFilamentsUseCase } from "@printing/application/use-cases/list-filaments";
import { CreateFilamentUseCase } from "@printing/application/use-cases/create-filament";
import { DeleteFilamentUseCase } from "@printing/application/use-cases/delete-filament";

export class DiContainer {
    public readonly prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    //#region Repositories
    private _userRepository?: UserRepository;
    public getUserRepository(): UserRepository {
        if (!this._userRepository) {
            this._userRepository = new PrismaUserRepository(this.prisma);
        }
        return this._userRepository;
    }

    private _apiKeyRepository?: ApiKeyRepository;
    public getApiKeyRepository(): ApiKeyRepository {
        if (!this._apiKeyRepository) {
            this._apiKeyRepository = new PrismaApiKeyRepository(this.prisma);
        }
        return this._apiKeyRepository;
    }

    private _coworkingSettingsRepository?: CoworkingSettingsRepository;
    public getCoworkingSettingsRepository(): CoworkingSettingsRepository {
        if (!this._coworkingSettingsRepository) {
            this._coworkingSettingsRepository = new PrismaCoworkingSettingsRepository(this.prisma);
        }
        return this._coworkingSettingsRepository;
    }

    private _spaceOperatingHoursRepository?: SpaceOperatingHoursRepository;
    public getSpaceOperatingHoursRepository(): SpaceOperatingHoursRepository {
        if (!this._spaceOperatingHoursRepository) {
            this._spaceOperatingHoursRepository = new PrismaSpaceOperatingHoursRepository(this.prisma);
        }
        return this._spaceOperatingHoursRepository;
    }

    private _accessLogRepository?: AccessLogRepository;
    public getAccessLogRepository(): AccessLogRepository {
        if (!this._accessLogRepository) {
            this._accessLogRepository = new PrismaAccessLogRepository(this.prisma);
        }
        return this._accessLogRepository;
    }

    private _bookingRepository?: BookingRepository;
    public getBookingRepository(): BookingRepository {
        if (!this._bookingRepository) {
            this._bookingRepository = new PrismaBookingRepository(this.prisma);
        }
        return this._bookingRepository;
    }

    private _roomRepository?: RoomRepository;
    public getRoomRepository(): RoomRepository {
        if (!this._roomRepository) {
            this._roomRepository = new PrismaRoomRepository(this.prisma);
        }
        return this._roomRepository;
    }

    private _calendarRepository?: CalendarRepository;
    public getCalendarRepository(): CalendarRepository {
        if (!this._calendarRepository) {
            this._calendarRepository = new PrismaCalendarRepository(this.prisma);
        }
        return this._calendarRepository;
    }

    private _printerRepository?: PrinterRepository;
    public getPrinterRepository(): PrinterRepository {
        if (!this._printerRepository) {
            this._printerRepository = new PrismaPrinterRepository(this.prisma);
        }
        return this._printerRepository;
    }

    private _printRequestRepository?: PrintRequestRepository;
    public getPrintRequestRepository(): PrintRequestRepository {
        if (!this._printRequestRepository) {
            this._printRequestRepository = new PrismaPrintRequestRepository(this.prisma);
        }
        return this._printRequestRepository;
    }

    private _storedFileRepository?: StoredFileRepository;
    public getStoredFileRepository(): StoredFileRepository {
        if (!this._storedFileRepository) {
            this._storedFileRepository = new PrismaStoredFileRepository(this.prisma);
        }
        return this._storedFileRepository;
    }

    private _filamentRepository?: FilamentRepository;
    public getFilamentRepository(): FilamentRepository {
        if (!this._filamentRepository) {
            this._filamentRepository = new PrismaFilamentRepository(this.prisma);
        }
        return this._filamentRepository;
    }
    //#endregion


    //#region Services
    private _authTokenService?: AuthTokenService;
    public getAuthTokenService(): AuthTokenService {
        if (!this._authTokenService) {
            this._authTokenService = new JwtAuthTokenService(this.getUserRepository());
        }
        return this._authTokenService;
    }

    /** Chave geral da integração gov.br, vinda de GOVBR_ENABLED. */
    public isGovbrEnabled(): boolean {
        return this.govbrLigado;
    }

    private get govbrLigado(): boolean {
        return env.GOVBR_ENABLED === "true";
    }

    private _govbrAuthRequestRepository?: GovbrAuthRequestRepository;
    public getGovbrAuthRequestRepository(): GovbrAuthRequestRepository {
        if (!this._govbrAuthRequestRepository) {
            this._govbrAuthRequestRepository = new PrismaGovbrAuthRequestRepository(this.prisma);
        }
        return this._govbrAuthRequestRepository;
    }

    private _startGovbrLoginUseCase?: StartGovbrLoginUseCase;
    public getStartGovbrLoginUseCase(): StartGovbrLoginUseCase {
        if (!this._startGovbrLoginUseCase) {
            this._startGovbrLoginUseCase = new StartGovbrLoginUseCase(
                this.getGovbrOidcService(),
                this.getGovbrAuthRequestRepository(),
                this.govbrLigado,
            );
        }
        return this._startGovbrLoginUseCase;
    }

    private _govbrPendingIdentityRepository?: GovbrPendingIdentityRepository;
    public getGovbrPendingIdentityRepository(): GovbrPendingIdentityRepository {
        if (!this._govbrPendingIdentityRepository) {
            this._govbrPendingIdentityRepository = new PrismaGovbrPendingIdentityRepository(this.prisma);
        }
        return this._govbrPendingIdentityRepository;
    }

    private _linkGovbrToAccountUseCase?: LinkGovbrToAccountUseCase;
    public getLinkGovbrToAccountUseCase(): LinkGovbrToAccountUseCase {
        if (!this._linkGovbrToAccountUseCase) {
            this._linkGovbrToAccountUseCase = new LinkGovbrToAccountUseCase(
                this.getGovbrPendingIdentityRepository(),
                this.getUserRepository(),
                this.getPasswordHashService(),
                this.getAuthTokenService(),
                this.govbrLigado,
            );
        }
        return this._linkGovbrToAccountUseCase;
    }

    private _completeGovbrRegistrationUseCase?: CompleteGovbrRegistrationUseCase;
    public getCompleteGovbrRegistrationUseCase(): CompleteGovbrRegistrationUseCase {
        if (!this._completeGovbrRegistrationUseCase) {
            this._completeGovbrRegistrationUseCase = new CompleteGovbrRegistrationUseCase(
                this.getGovbrPendingIdentityRepository(),
                this.getUserRepository(),
                this.getAuthTokenService(),
                this.govbrLigado,
            );
        }
        return this._completeGovbrRegistrationUseCase;
    }

    private _completeGovbrLoginUseCase?: CompleteGovbrLoginUseCase;
    public getCompleteGovbrLoginUseCase(): CompleteGovbrLoginUseCase {
        if (!this._completeGovbrLoginUseCase) {
            this._completeGovbrLoginUseCase = new CompleteGovbrLoginUseCase(
                this.getGovbrOidcService(),
                this.getGovbrAuthRequestRepository(),
                this.getGovbrPendingIdentityRepository(),
                this.getUserRepository(),
                this.getAuthTokenService(),
                this.govbrLigado,
            );
        }
        return this._completeGovbrLoginUseCase;
    }

    // Instanciado sob demanda: sem as variáveis GOVBR_* o construtor lança, mas
    // só para quem tentar usar a integração — a API sobe normalmente sem elas.
    private _govbrOidcService?: GovbrOidcService;
    public getGovbrOidcService(): GovbrOidcService {
        if (!this._govbrOidcService) {
            this._govbrOidcService = new OpenIdGovbrOidcService();
        }
        return this._govbrOidcService;
    }

    private _passwordHashService?: PasswordHashService;
    public getPasswordHashService(): PasswordHashService {
        if (!this._passwordHashService) {
            this._passwordHashService = new BcryptPasswordHashService();
        }
        return this._passwordHashService;
    }

    private _passwordResetTokenService?: PasswordResetTokenService;
    public getPasswordResetTokenService(): PasswordResetTokenService {
        if (!this._passwordResetTokenService) {
            this._passwordResetTokenService = new JwtPasswordResetTokenService();
        }
        return this._passwordResetTokenService;
    }

    private _passwordResetEmailTemplater?: PasswordResetEmailTemplater;
    public getPasswordResetEmailTemplater(): PasswordResetEmailTemplater {
        if (!this._passwordResetEmailTemplater) {
            this._passwordResetEmailTemplater = new TemplateStringPasswordResetEmailTemplater();
        }
        return this._passwordResetEmailTemplater;
    }

    private _passwordResetCodeEmailTemplater?: PasswordResetCodeEmailTemplater;
    public getPasswordResetCodeEmailTemplater(): PasswordResetCodeEmailTemplater {
        if (!this._passwordResetCodeEmailTemplater) {
            this._passwordResetCodeEmailTemplater = new TemplateStringPasswordResetCodeEmailTemplater();
        }
        return this._passwordResetCodeEmailTemplater;
    }

    private _welcomeEmailTemplater?: WelcomeEmailTemplater;
    public getWelcomeEmailTemplater(): WelcomeEmailTemplater {
        if (!this._welcomeEmailTemplater) {
            this._welcomeEmailTemplater = new TemplateStringWelcomeEmailTemplater();
        }
        return this._welcomeEmailTemplater;
    }

    private _spaceOperatingHoursService?: SpaceOperatingHoursService;
    public getSpaceOperatingHoursService(): SpaceOperatingHoursService {
        if (!this._spaceOperatingHoursService) {
            this._spaceOperatingHoursService = new SpaceOperatingHoursService(this.getSpaceOperatingHoursRepository());
        }
        return this._spaceOperatingHoursService;
    }

    private _totemCheckinNotifier?: TotemCheckinNotifier;
    public getTotemCheckinNotifier(): TotemCheckinNotifier {
        if (!this._totemCheckinNotifier) {
            this._totemCheckinNotifier = new MemoryPublisherTotemCheckinNotifier();
        }
        return this._totemCheckinNotifier;
    }

    private _totemCheckinAccessCodeManager?: TotemCheckinAccessCodeManager;
    public getTotemCheckinAccessCodeManager(): TotemCheckinAccessCodeManager {
        if (!this._totemCheckinAccessCodeManager) {
            this._totemCheckinAccessCodeManager = new MemoryTotemCheckinAccessCodeManager(
                this.getApiKeyRepository()
            );
        }
        return this._totemCheckinAccessCodeManager;
    }

    private _bookingService?: BookingService;
    public getBookingService(): BookingService {
        if (!this._bookingService) {
            this._bookingService = new BookingService(
                this.getBookingRepository(),
                this.getSpaceOperatingHoursService(),
                this.getRoomRepository(),
                this.getUserRepository()
            );
        }
        return this._bookingService;
    }

    private _bookingEmailTemplater?: BookingEmailTemplater;
    public getBookingEmailTemplater(): BookingEmailTemplater {
        if (!this._bookingEmailTemplater) {
            this._bookingEmailTemplater = new TemplateStringBookingEmailTemplater();
        }
        return this._bookingEmailTemplater;
    }

    private _bookingReminderEmailTemplater?: BookingReminderEmailTemplater;
    public getBookingReminderEmailTemplater(): BookingReminderEmailTemplater {
        if (!this._bookingReminderEmailTemplater) {
            this._bookingReminderEmailTemplater = new TemplateStringBookingReminderEmailTemplater();
        }
        return this._bookingReminderEmailTemplater;
    }

    private _sendEmailService?: SendEmailService;
    public getSendEmailService(): SendEmailService {
        if (!this._sendEmailService) {
            this._sendEmailService = (env.NODEMAILER_EMAIL_USER && env.NODEMAILER_EMAIL_PASS)
                ? new NodemailerSendEmailService(env.NODEMAILER_EMAIL_USER, env.NODEMAILER_EMAIL_PASS)
                : new ConsoleSendEmailService();
        }
        return this._sendEmailService;
    }

    private _accessService?: AccessService;
    public getAccessService(): AccessService {
        if (!this._accessService) {
            this._accessService = new AccessService(
                this.getAccessLogRepository(),
                this.getCoworkingSettingsRepository()
            );
        }
        return this._accessService;
    }

    private _accessLogService?: AccessLogService;
    public getAccessLogService(): AccessLogService {
        if (!this._accessLogService) {
            this._accessLogService = new AccessLogService(
                this.getAccessLogRepository(),
                this.getUserRepository()
            );
        }
        return this._accessLogService;
    }

    private _reportService?: ReportService;
    public getReportService(): ReportService {
        if (!this._reportService) {
            this._reportService = new ReportService(
                this.getBookingService(),
                this.getAccessLogService()
            );
        }
        return this._reportService;
    }

    private _renderReportService?: RenderReportService;
    public getRenderReportService(): RenderReportService {
        if (!this._renderReportService) {
            this._renderReportService = new ReactPdfRenderReportService();
        }
        return this._renderReportService;
    }

    private _passwordService?: PasswordService;
    public getPasswordService(): PasswordService {
        if (!this._passwordService) {
            this._passwordService = new PasswordService(
                this.getPasswordHashService(),
                this.getUserRepository(),
                this.getPasswordResetTokenService()
            );
        }
        return this._passwordService;
    }

    private _authService?: AuthService;
    public getAuthService(): AuthService {
        if (!this._authService) {
            this._authService = new AuthService(
                this.getUserRepository(),
                this.getPasswordHashService(),
                this.getAuthTokenService(),
            );
        }
        return this._authService;
    }

    private _calendarService?: CalendarService;
    public getCalendarService(): CalendarService {
        if (!this._calendarService) {
            this._calendarService = new GoogleCalendarService(
                this.getCalendarRepository(),
                this.getRoomRepository(),
                this.getUserRepository(),
                env.GOOGLE_CALENDAR_ID ?? '',
                env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '',
                env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? '',
            );
        }
        return this._calendarService;
    }

    private _bucketStorageService?: BucketStorageService;
    public getBucketStorageService(): BucketStorageService {
        if (!this._bucketStorageService) {
            if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY || !env.STORAGE_BUCKET) {
                throw new Error(
                    "Storage não configurado: defina SUPABASE_URL, SUPABASE_SECRET_KEY e STORAGE_BUCKET no .env (Supabase Storage).",
                );
            }
            this._bucketStorageService = new SupabaseBucketStorageService({
                url: env.SUPABASE_URL,
                secretKey: env.SUPABASE_SECRET_KEY,
                bucket: env.STORAGE_BUCKET,
            });
        }
        return this._bucketStorageService;
    }

    private _storedFileService?: StoredFileService;
    public getStoredFileService(): StoredFileService {
        if (!this._storedFileService) {
            this._storedFileService = new StoredFileService(
                this.getStoredFileRepository(),
                this.getBucketStorageService(),
            );
        }
        return this._storedFileService;
    }

    private _printRequestService?: PrintRequestService;
    public getPrintRequestService(): PrintRequestService {
        if (!this._printRequestService) {
            this._printRequestService = new PrintRequestService(
                this.getPrintRequestRepository(),
                this.getPrinterRepository(),
                this.getFilamentRepository(),
                this.getStoredFileService(),
            );
        }
        return this._printRequestService;
    }

    private _printRequestEmailTemplater?: PrintRequestEmailTemplater;
    public getPrintRequestEmailTemplater(): PrintRequestEmailTemplater {
        if (!this._printRequestEmailTemplater) {
            this._printRequestEmailTemplater = new TemplateStringPrintRequestEmailTemplater();
        }
        return this._printRequestEmailTemplater;
    }
    //#endregion

    //#region Use Cases
    public getAuthUserService(authUser: User): AuthUserService {
        return new AuthUserService(authUser);
    }

    public getAuthApiKeyService(apiKey: ApiKey): AuthApiKeyService {
        return new AuthApiKeyService(apiKey);
    }

    public getRegisterUserUseCase(): RegisterUserUseCase {
        const registerUserUseCase = new RegisterUserUseCase(
            this.getAuthService(),
        );
        return registerUserUseCase;
    }

    public getCreateApiKeyUseCase(authUser: User): CreateApiKeyUseCase {
        return new CreateApiKeyUseCase(
            this.getAuthUserService(authUser),
            this.getApiKeyRepository()
        );
    }

    public getListApiKeysUseCase(authUser: User): ListApiKeysUseCase {
        return new ListApiKeysUseCase(
            this.getAuthUserService(authUser),
            this.getApiKeyRepository()
        );
    }

    public getRevokeApiKeyUseCase(authUser: User): RevokeApiKeyUseCase {
        return new RevokeApiKeyUseCase(
            this.getAuthUserService(authUser),
            this.getApiKeyRepository()
        );
    }



    public getGetAuthUserUseCase(authUser: User): GetAuthUserUseCase {
        const getAuthUserUseCase = new GetAuthUserUseCase(
            this.getAuthUserService(authUser)
        );
        return getAuthUserUseCase;
    }

    public getLoginUseCase(): LoginUseCase {
        const loginUseCase = new LoginUseCase(
            this.getAuthService(),
        );
        return loginUseCase;
    }

    public getRequestPasswordResetUseCase(): RequestPasswordResetUseCase {
        const requestPasswordResetUseCase = new RequestPasswordResetUseCase(
            this.getPasswordService(),
        );
        return requestPasswordResetUseCase;
    }

    public getExecutePasswordResetUseCase(): ExecutePasswordResetUseCase {
        const executePasswordResetUseCase = new ExecutePasswordResetUseCase(
            this.getPasswordService(),
        );
        return executePasswordResetUseCase;
    }

    public getRequestPasswordResetCodeUseCase(): RequestPasswordResetCodeUseCase {
        return new RequestPasswordResetCodeUseCase(this.getPasswordService());
    }

    public getVerifyPasswordResetCodeUseCase(): VerifyPasswordResetCodeUseCase {
        return new VerifyPasswordResetCodeUseCase(this.getPasswordService());
    }

    public getExecutePasswordResetWithCodeUseCase(): ExecutePasswordResetWithCodeUseCase {
        return new ExecutePasswordResetWithCodeUseCase(this.getPasswordService());
    }

    public getChangePasswordUseCase(authUser: User): ChangePasswordUseCase {
        const changePasswordUseCase = new ChangePasswordUseCase(
            this.getAuthUserService(authUser),
            this.getPasswordService(),
        );
        return changePasswordUseCase;
    }

    public getPerformCheckinUseCase(authUser: User): PerformCheckinUseCase {
        return new PerformCheckinUseCase(
            this.getAuthUserService(authUser),
            this.getAccessService(),
            this.getTotemCheckinAccessCodeManager()
        );
    }

    public getPerformCheckoutUseCase(authUser: User): PerformCheckoutUseCase {
        const performCheckoutUseCase = new PerformCheckoutUseCase(
            this.getAuthUserService(authUser),
            this.getAccessService()
        );
        return performCheckoutUseCase;
    }

    public getCheckinByCpfUseCase(): CheckinByCpfUseCase {
        return new CheckinByCpfUseCase(
            this.getUserRepository(),
            this.getAccessService()
        );
    }

    public getCheckoutByCpfUseCase(): CheckoutByCpfUseCase {
        return new CheckoutByCpfUseCase(
            this.getUserRepository(),
            this.getAccessService()
        );
    }

    public getFindMemberByCpfUseCase(): FindMemberByCpfUseCase {
        return new FindMemberByCpfUseCase(this.getUserRepository());
    }

    public getFindActiveMemberByCpfUseCase(): FindActiveMemberByCpfUseCase {
        return new FindActiveMemberByCpfUseCase(this.getUserRepository(), this.getAccessLogRepository());
    }

    public getQuickCheckoutByCpfUseCase(): QuickCheckoutByCpfUseCase {
        return new QuickCheckoutByCpfUseCase(this.getUserRepository(), this.getAccessService());
    }

    public getListUserAccessLogsUseCase(authUser: User): ListUserAccessLogsUseCase {
        const listUserAccessLogsUseCase = new ListUserAccessLogsUseCase(
            this.getAccessLogRepository(),
            this.getAuthUserService(authUser)
        );
        return listUserAccessLogsUseCase;
    }

    public getGetMyCheckinStatusUseCase(authUser: User): GetMyCheckinStatusUseCase {
        const getMyCheckinStatusUseCase = new GetMyCheckinStatusUseCase(
            this.getAccessLogRepository(),
            this.getAuthUserService(authUser)
        );
        return getMyCheckinStatusUseCase;
    }

    public getListAllAccessLogsUseCase(authUser: User): ListAllAccessLogsUseCase {
        const listAllAccessLogsUseCase = new ListAllAccessLogsUseCase(
            this.getAccessLogRepository(),
            this.getAuthUserService(authUser)
        );
        return listAllAccessLogsUseCase;
    }

    public getAutoCheckoutAllUseCase(): AutoCheckoutAllUseCase {
        const autoCheckoutAllUseCase = new AutoCheckoutAllUseCase(
            this.getAccessService()
        );
        return autoCheckoutAllUseCase;
    }

    public getConfigureCoworkingUseCase(authUser: User): ConfigureCoworkingUseCase {
        const configureCoworkingUseCase = new ConfigureCoworkingUseCase(
            this.getAuthUserService(authUser),
            this.getCoworkingSettingsRepository()
        );
        return configureCoworkingUseCase;
    }

    public getAdminPerformCheckinUseCase(authUser: User): AdminPerformCheckinUseCase {
        const adminPerformCheckinUseCase = new AdminPerformCheckinUseCase(
            this.getAuthUserService(authUser),
            this.getAccessService()
        );
        return adminPerformCheckinUseCase;
    }

    public getAdminPerformCheckoutUseCase(authUser: User): AdminPerformCheckoutUseCase {
        const adminPerformCheckoutUseCase = new AdminPerformCheckoutUseCase(
            this.getAuthUserService(authUser),
            this.getAccessService()
        );
        return adminPerformCheckoutUseCase;
    }

    public getCountActiveAccessLogsUseCase(authUser: User): CountActiveAccessLogsUseCase {
        const countActiveAccessLogsUseCase = new CountActiveAccessLogsUseCase(
            this.getAccessLogRepository(),
            this.getAuthUserService(authUser)
        );
        return countActiveAccessLogsUseCase;
    }

    public getGenerateTotemAccessCodeUseCase(apiKey: ApiKey): GenerateTotemAccessCodeUseCase {
        return new GenerateTotemAccessCodeUseCase(
            this.getAuthApiKeyService(apiKey),
            this.getTotemCheckinAccessCodeManager()
        );
    }

    public getCreateRoomUseCase(authUser: User): CreateRoomUseCase {
        const createRoomUseCase = new CreateRoomUseCase(
            this.getRoomRepository(),
            this.getAuthUserService(authUser)
        );
        return createRoomUseCase;
    }

    public getListRoomsUseCase(authUser: User): ListRoomsUseCase {
        const listRoomsUseCase = new ListRoomsUseCase(
            this.getAuthUserService(authUser),
            this.getRoomRepository(),
            this.getSpaceOperatingHoursRepository()
        );
        return listRoomsUseCase;
    }

    public getGetRoomByIdUseCase(authUser: User): GetRoomByIdUseCase {
        const getRoomByIdUseCase = new GetRoomByIdUseCase(
            this.getAuthUserService(authUser),
            this.getRoomRepository()
        );
        return getRoomByIdUseCase;
    }

    public getUpdateRoomUseCase(authUser: User): UpdateRoomUseCase {
        const updateRoomUseCase = new UpdateRoomUseCase(
            this.getAuthUserService(authUser),
            this.getRoomRepository()
        );
        return updateRoomUseCase;
    }

    public getDeleteRoomUseCase(authUser: User): DeleteRoomUseCase {
        const deleteRoomUseCase = new DeleteRoomUseCase(
            this.getAuthUserService(authUser),
            this.getRoomRepository()
        );
        return deleteRoomUseCase;
    }

    public getSetRoomEnabledUseCase(authUser: User): SetRoomEnabledUseCase {
        const setRoomEnabledUseCase = new SetRoomEnabledUseCase(
            this.getAuthUserService(authUser),
            this.getRoomRepository()
        );
        return setRoomEnabledUseCase;
    }

    public getRequestBookingUseCase(authUser: User): RequestBookingUseCase {
        const requestBookingUseCase = new RequestBookingUseCase(
            this.getAuthUserService(authUser),
            this.getBookingService()
        );
        return requestBookingUseCase;
    }

    public getProcessBookingRequestUseCase(authUser: User): ProcessBookingRequestUseCase {
        const processBookingRequestUseCase = new ProcessBookingRequestUseCase(
            this.getAuthUserService(authUser),
            this.getBookingRepository(),
        );
        return processBookingRequestUseCase;
    }

    public getCancelBookingUseCase(authUser: User): CancelBookingUseCase {
        const cancelBookingUseCase = new CancelBookingUseCase(
            this.getAuthUserService(authUser),
            this.getBookingRepository()
        );
        return cancelBookingUseCase;
    }

    public getAdminCancelBookingUseCase(authUser: User): AdminCancelBookingUseCase {
        const adminCancelBookingUseCase = new AdminCancelBookingUseCase(
            this.getAuthUserService(authUser),
            this.getBookingRepository(),
        );
        return adminCancelBookingUseCase;
    }

    public getFindBookingsUseCase(authUser: User): FindBookingsUseCase {
        const findBookingsUseCase = new FindBookingsUseCase(
            this.getAuthUserService(authUser),
            this.getBookingRepository()
        );
        return findBookingsUseCase;
    }

    public getFindMyBookingsUseCase(authUser: User): FindMyBookingsUseCase {
        const findMyBookingsUseCase = new FindMyBookingsUseCase(
            this.getAuthUserService(authUser),
            this.getBookingRepository()
        );
        return findMyBookingsUseCase;
    }

    public getGetBookingByIdUseCase(authUser: User): GetBookingByIdUseCase {
        return new GetBookingByIdUseCase(
            this.getAuthUserService(authUser),
            this.getBookingRepository(),
            this.getRoomRepository(),
            this.getUserRepository()
        );
    }

    public getListAvailableSlotsByDayUseCase(authUser: User): ListAvailableSlotsByDayUseCase {
        const listAvailableSlotsByDayUseCase = new ListAvailableSlotsByDayUseCase(
            this.getAuthUserService(authUser),
            this.getBookingService()
        );
        return listAvailableSlotsByDayUseCase;
    }

    public getSendBookingRemindersOfTomorrowUseCase(): SendBookingRemindersOfTomorrowUseCase {
        const sendBookingRemindersOfTomorrowUseCase = new SendBookingRemindersOfTomorrowUseCase(
            this.getBookingRepository(),
            this.getUserRepository(),
            this.getBookingReminderEmailTemplater(),
            this.getSendEmailService(),
            this.getRoomRepository()
        );
        return sendBookingRemindersOfTomorrowUseCase;
    }

    public getSetDefaultOperatingScheduleUseCase(authUser: User): SetDefaultOperatingScheduleUseCase {
        const setDefaultOperatingScheduleUseCase = new SetDefaultOperatingScheduleUseCase(
            this.getAuthUserService(authUser),
            this.getRoomRepository(),
            this.getSpaceOperatingHoursService()
        );
        return setDefaultOperatingScheduleUseCase;
    }

    public getAddOperatingHoursOverrideUseCase(authUser: User): AddOperatingHoursOverrideUseCase {
        const addOperatingHoursOverrideUseCase = new AddOperatingHoursOverrideUseCase(
            this.getAuthUserService(authUser),
            this.getRoomRepository(),
            this.getSpaceOperatingHoursService()
        );
        return addOperatingHoursOverrideUseCase;
    }

    public getGetRoomOperatingScheduleUseCase(authUser: User): GetRoomOperatingScheduleUseCase {
        return new GetRoomOperatingScheduleUseCase(
            this.getAuthUserService(authUser),
            this.getRoomRepository(),
            this.getSpaceOperatingHoursRepository()
        );
    }

    public getGetGlobalBlockedDatesUseCase(authUser: User): GetGlobalBlockedDatesUseCase {
        return new GetGlobalBlockedDatesUseCase(
            this.getAuthUserService(authUser),
            this.getSpaceOperatingHoursRepository()
        );
    }

    public getSetGlobalBlockedDatesUseCase(authUser: User): SetGlobalBlockedDatesUseCase {
        return new SetGlobalBlockedDatesUseCase(
            this.getAuthUserService(authUser),
            this.getRoomRepository(),
            this.getSpaceOperatingHoursService(),
            this.getSpaceOperatingHoursRepository()
        );
    }

    public getListUsersUseCase(authUser: User): ListUsersUseCase {
        return new ListUsersUseCase(
            this.getAuthUserService(authUser),
            this.getUserRepository(),
        );
    }

    public getUpdateUserUseCase(authUser: User): UpdateUserUseCase {
        return new UpdateUserUseCase(
            this.getAuthUserService(authUser),
            this.getUserRepository(),
        );
    }

    public getUpdateMeUseCase(authUser: User): UpdateMeUseCase {
        return new UpdateMeUseCase(
            this.getAuthUserService(authUser),
            this.getUserRepository(),
        );
    }

    public getDeleteUserUseCase(authUser: User): DeleteUserUseCase {
        return new DeleteUserUseCase(
            this.getAuthUserService(authUser),
            this.getUserRepository(),
        );
    }

    public getListActiveSessionsUseCase(authUser: User): ListActiveSessionsUseCase {
        return new ListActiveSessionsUseCase(
            this.getAuthUserService(authUser),
            this.getAccessLogRepository(),
            this.getUserRepository(),
        );
    }

    public getWeeklyFrequencyUseCase(authUser: User): GetWeeklyFrequencyUseCase {
        return new GetWeeklyFrequencyUseCase(
            this.getAccessLogRepository(),
            this.getAuthUserService(authUser),
        );
    }

    public getAccessStatsUseCase(authUser: User): GetAccessStatsUseCase {
        return new GetAccessStatsUseCase(
            this.getAccessLogRepository(),
            this.getAuthUserService(authUser),
        );
    }

    public getYearlyReportUseCase(authUser: User): GetYearlyReportUseCase {
        return new GetYearlyReportUseCase(
            this.getAccessLogRepository(),
            this.getAuthUserService(authUser),
        );
    }

    public getFindBookingsAdminUseCase(authUser: User): FindBookingsAdminUseCase {
        return new FindBookingsAdminUseCase(
            this.getBookingRepository(),
            this.getAuthUserService(authUser),
        );
    }

    public getMarkBookingNoShowUseCase(authUser: User): MarkBookingNoShowUseCase {
        return new MarkBookingNoShowUseCase(
            this.getAuthUserService(authUser),
            this.getBookingRepository(),
        );
    }

    public getAdminCreateBookingUseCase(authUser: User): AdminCreateBookingUseCase {
        return new AdminCreateBookingUseCase(
            this.getAuthUserService(authUser),
            this.getBookingService(),
        );
    }

    public getUpdateBookingNumberOfPeopleUseCase(authUser: User): UpdateBookingNumberOfPeopleUseCase {
        return new UpdateBookingNumberOfPeopleUseCase(
            this.getAuthUserService(authUser),
            this.getBookingRepository(),
        );
    }

    public getRecentActivitiesUseCase(authUser: User): GetRecentActivitiesUseCase {
        return new GetRecentActivitiesUseCase(
            this.prisma,
            this.getAuthUserService(authUser),
        );
    }

    public getListAccessLogsByDayUseCase(authUser: User): ListAccessLogsByDayUseCase {
        return new ListAccessLogsByDayUseCase(
            this.getAuthUserService(authUser),
            this.getAccessLogService(),
        );
    }

    public getGenerateMonthReportUseCase(authUser: User): GenerateMonthReportUseCase {
        return new GenerateMonthReportUseCase(
            this.getAuthUserService(authUser),
            this.getReportService(),
        );
    }

    public getGenerateAndRenderMonthReportUseCase(authUser: User): GenerateAndRenderMonthReportUseCase {
        return new GenerateAndRenderMonthReportUseCase(
            this.getAuthUserService(authUser),
            this.getReportService(),
            this.getRenderReportService(),
        );
    }

    public getRequestPrintUseCase(authUser: User): RequestPrintUseCase {
        return new RequestPrintUseCase(this.getAuthUserService(authUser), this.getPrintRequestService());
    }

    public getUploadFileUseCase(authUser: User): UploadFileUseCase {
        return new UploadFileUseCase(this.getAuthUserService(authUser), this.getStoredFileService());
    }

    public getCreatePrintFileDownloadUrlUseCase(authUser: User): CreatePrintFileDownloadUrlUseCase {
        return new CreatePrintFileDownloadUrlUseCase(this.getAuthUserService(authUser), this.getPrintRequestRepository(), this.getStoredFileService());
    }

    public getCancelPrintRequestUseCase(authUser: User): CancelPrintRequestUseCase {
        return new CancelPrintRequestUseCase(this.getAuthUserService(authUser), this.getPrintRequestRepository());
    }

    public getFindMyPrintRequestsUseCase(authUser: User): FindMyPrintRequestsUseCase {
        return new FindMyPrintRequestsUseCase(this.getAuthUserService(authUser), this.getPrintRequestRepository());
    }

    public getGetPrintRequestByIdUseCase(authUser: User): GetPrintRequestByIdUseCase {
        return new GetPrintRequestByIdUseCase(this.getAuthUserService(authUser), this.getPrintRequestRepository(), this.getFilamentRepository(), this.getStoredFileService());
    }

    public getProcessPrintRequestUseCase(authUser: User): ProcessPrintRequestUseCase {
        return new ProcessPrintRequestUseCase(this.getAuthUserService(authUser), this.getPrintRequestRepository());
    }

    public getAllocatePrinterUseCase(authUser: User): AllocatePrinterUseCase {
        return new AllocatePrinterUseCase(this.getAuthUserService(authUser), this.getPrintRequestRepository(), this.getPrinterRepository(), this.getPrintRequestService());
    }

    public getDeliverPrintRequestUseCase(authUser: User): DeliverPrintRequestUseCase {
        return new DeliverPrintRequestUseCase(this.getAuthUserService(authUser), this.getPrintRequestRepository());
    }

    public getDiscardPrintRequestUseCase(authUser: User): DiscardPrintRequestUseCase {
        return new DiscardPrintRequestUseCase(this.getAuthUserService(authUser), this.getPrintRequestRepository());
    }

    public getStartPrintProductionUseCase(authUser: User): StartPrintProductionUseCase {
        return new StartPrintProductionUseCase(this.getAuthUserService(authUser), this.getPrintRequestRepository(), this.getPrinterRepository(), this.getPrintRequestService());
    }

    public getCompletePrintRequestUseCase(authUser: User): CompletePrintRequestUseCase {
        return new CompletePrintRequestUseCase(this.getAuthUserService(authUser), this.getPrintRequestRepository());
    }

    public getAdminCancelPrintRequestUseCase(authUser: User): AdminCancelPrintRequestUseCase {
        return new AdminCancelPrintRequestUseCase(this.getAuthUserService(authUser), this.getPrintRequestRepository());
    }

    public getFindPrintRequestsAdminUseCase(authUser: User): FindPrintRequestsAdminUseCase {
        return new FindPrintRequestsAdminUseCase(
            this.getAuthUserService(authUser),
            this.getPrintRequestRepository(),
            this.getUserRepository(),
            this.getPrinterRepository(),
            this.getFilamentRepository(),
            this.getStoredFileRepository(),
         );
    }

    public getListPrintersUseCase(authUser: User): ListPrintersUseCase {
        return new ListPrintersUseCase(this.getAuthUserService(authUser), this.getPrinterRepository(), this.getPrintRequestRepository());
    }

    public getGetPrinterByIdUseCase(authUser: User): GetPrinterByIdUseCase {
        return new GetPrinterByIdUseCase(this.getAuthUserService(authUser), this.getPrinterRepository());
    }

    public getCreatePrinterUseCase(authUser: User): CreatePrinterUseCase {
        return new CreatePrinterUseCase(this.getAuthUserService(authUser), this.getPrinterRepository());
    }

    public getUpdatePrinterUseCase(authUser: User): UpdatePrinterUseCase {
        return new UpdatePrinterUseCase(this.getAuthUserService(authUser), this.getPrinterRepository());
    }

    public getSetPrinterEnabledUseCase(authUser: User): SetPrinterEnabledUseCase {
        return new SetPrinterEnabledUseCase(this.getAuthUserService(authUser), this.getPrinterRepository());
    }

    public getDeletePrinterUseCase(authUser: User): DeletePrinterUseCase {
        return new DeletePrinterUseCase(this.getAuthUserService(authUser), this.getPrinterRepository(), this.getPrintRequestRepository());
    }

    public getListFilamentsUseCase(authUser: User): ListFilamentsUseCase {
        return new ListFilamentsUseCase(this.getAuthUserService(authUser), this.getFilamentRepository());
    }

    public getCreateFilamentUseCase(authUser: User): CreateFilamentUseCase {
        return new CreateFilamentUseCase(this.getAuthUserService(authUser), this.getFilamentRepository());
    }

    public getDeleteFilamentUseCase(authUser: User): DeleteFilamentUseCase {
        return new DeleteFilamentUseCase(this.getAuthUserService(authUser), this.getFilamentRepository(), this.getPrintRequestRepository());
    }
    //#endregion
}

const container = new DiContainer();

//#region Domain Events
new AfterPasswordResetRequested(
    container.getSendEmailService(),
    container.getPasswordResetEmailTemplater()
);

new AfterPasswordResetCodeRequested(
    container.getSendEmailService(),
    container.getPasswordResetCodeEmailTemplater()
);

new AfterUserRegistered(
    container.getSendEmailService(),
    container.getWelcomeEmailTemplater()
);

new AfterBookingStatusChanged(
    container.getSendEmailService(),
    container.getUserRepository(),
    container.getRoomRepository(),
    container.getBookingEmailTemplater(),
    env.ADMIN_URL,
    container.getCalendarService(),
);

new AfterUserCheckin(
    container.getTotemCheckinNotifier(),
);

new AfterPrintRequestStatusChanged(
    container.getSendEmailService(),
    container.getUserRepository(),
    container.getPrintRequestEmailTemplater(),
    container.getFilamentRepository(),
    container.getStoredFileService(),
    env.ADMIN_URL,
);
//#endregion


export default container;
