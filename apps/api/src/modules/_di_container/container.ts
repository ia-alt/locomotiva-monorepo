import { BcryptPasswordHashService, JwtAuthTokenService, JwtPasswordResetTokenService, TemplateStringPasswordResetEmailTemplater } from "src/modules/identity/infra/services";
import { PrismaUserRepository } from "src/modules/identity/infra/repositories";
import { UserRepository } from "src/modules/identity/domain/repositories";
import { PrismaClient } from "@core/infra/database/prisma";
import { prisma } from "@core/infra/database/prisma/prisma-instance";
import { RegisterUserUseCase } from "src/modules/identity/application/use-cases/register-user";
import { CoworkingSettingsRepository, AccessLogRepository } from "@coworking/domain/repositories";
import { PrismaCoworkingSettingsRepository } from "@coworking/infra/repositories/prisma-coworking-settings";
import { PrismaAccessLogRepository } from "@coworking/infra/repositories/prisma-access-log";
import { SpaceOperatingHoursRepository } from "@operating-hours/domain/repositories/space-operating-hours";
import { PrismaSpaceOperatingHoursRepository } from "@operating-hours/infra/repositories/prisma-space-operating-hours";
import { SpaceOperatingHoursService } from "@operating-hours/domain/services";
import { BookingRepository, RoomRepository } from "@booking/domain/repositories";
import { PrismaBookingRepository } from "@booking/infra/repositories/prisma-booking";
import { PrismaRoomRepository } from "@booking/infra/repositories/prisma-room";
import { BookingService } from "@booking/domain/services";
import { BookingReminderEmailTemplater } from "@booking/application/services";
import { TemplateStringBookingReminderEmailTemplater } from "@booking/infra/services/template-string-booking-reminder-email-templater";
import { GetAuthUserUseCase } from "src/modules/identity/application/use-cases/get-auth-user";
import { User } from "src/modules/identity/domain/entities";
import { AuthService, AuthTokenService, AuthUserService, PasswordHashService, PasswordResetTokenService, PasswordService } from "src/modules/identity/domain/services";
import { LoginUseCase } from "src/modules/identity/application/use-cases/login";
import { RequestPasswordResetUseCase } from "src/modules/identity/application/use-cases/request-password-reset";
import { ChangePasswordUseCase } from "src/modules/identity/application/use-cases/change-password";
import { ExecutePasswordResetUseCase } from "src/modules/identity/application/use-cases/execute-password-reset";
import { ListUsersUseCase } from "src/modules/identity/application/use-cases/list-users";
import { UpdateUserUseCase } from "src/modules/identity/application/use-cases/update-user";
import { DeleteUserUseCase } from "src/modules/identity/application/use-cases/delete-user";
import { SendEmailService } from "@notifications/application/services";
import { ConsoleSendEmailService } from "@notifications/infra/services/console-send-email";
import { PerformCheckinUseCase, PerformCheckoutUseCase, ListUserAccessLogsUseCase, ListAllAccessLogsUseCase, AutoCheckoutAllUseCase, ConfigureCoworkingUseCase, AdminPerformCheckinUseCase, AdminPerformCheckoutUseCase, CountActiveAccessLogsUseCase, GetMyCheckinStatusUseCase } from "@coworking/application/use-cases";
import { CreateRoomUseCase } from "@booking/application/use-cases/create-room";
import { ListRoomsUseCase } from "@booking/application/use-cases/list-rooms";
import { UpdateRoomUseCase } from "@booking/application/use-cases/update-room";
import { DeleteRoomUseCase } from "@booking/application/use-cases/delete-room";
import { SetRoomEnabledUseCase } from "@booking/application/use-cases/set-room-enabled";
import { RequestBookingUseCase } from "@booking/application/use-cases/request-booking";
import { ProcessBookingRequestUseCase } from "@booking/application/use-cases/process-booking-request";
import { CancelBookingUseCase } from "@booking/application/use-cases/cancel-booking";
import { AdminCancelBookingUseCase } from "@booking/application/use-cases/admin-cancel-booking";
import { FindBookingsUseCase } from "@booking/application/use-cases/find-bookings";
import { FindMyBookingsUseCase } from "@booking/application/use-cases/find-my-bookings";
import { ListAvailableSlotsByDayUseCase } from "@booking/application/use-cases/list-available-slots-by-day";
import { SendBookingRemindersOfTomorrowUseCase } from "@booking/application/use-cases/send-booking-reminders-of-tomorrow";
import { SetDefaultOperatingScheduleUseCase } from "@booking/application/use-cases/set-room-default-operating-hours";
import { AddOperatingHoursOverrideUseCase } from "@booking/application/use-cases/add-room-operating-hours-override";
import { GetRoomOperatingScheduleUseCase } from "@booking/application/use-cases/get-room-operating-schedule";
import { GetGlobalBlockedDatesUseCase } from "@booking/application/use-cases/get-global-blocked-dates";
import { SetGlobalBlockedDatesUseCase } from "@booking/application/use-cases/set-global-blocked-dates";
import { AccessService } from "@coworking/domain/services";
import { PasswordResetEmailTemplater } from "src/modules/identity/domain/services/password-reset-email-templater";

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
    //#endregion


    //#region Services
    private _authTokenService?: AuthTokenService;
    public getAuthTokenService(): AuthTokenService {
        if (!this._authTokenService) {
            this._authTokenService = new JwtAuthTokenService(this.getUserRepository());
        }
        return this._authTokenService;
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

    private _spaceOperatingHoursService?: SpaceOperatingHoursService;
    public getSpaceOperatingHoursService(): SpaceOperatingHoursService {
        if (!this._spaceOperatingHoursService) {
            this._spaceOperatingHoursService = new SpaceOperatingHoursService(this.getSpaceOperatingHoursRepository());
        }
        return this._spaceOperatingHoursService;
    }


    private _bookingService?: BookingService;
    public getBookingService(): BookingService {
        if (!this._bookingService) {
            this._bookingService = new BookingService(
                this.getBookingRepository(),
                this.getSpaceOperatingHoursService()
            );
        }
        return this._bookingService;
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
            this._sendEmailService = new ConsoleSendEmailService();
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

    private _passwordService?: PasswordService;
    public getPasswordService(): PasswordService {
        if (!this._passwordService) {
            this._passwordService = new PasswordService(
                this.getPasswordHashService(),
                this.getUserRepository(),
                this.getPasswordResetTokenService(),
                this.getPasswordResetEmailTemplater(),
                this.getSendEmailService()
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
    //#endregion

    //#region Use Cases
    public getAuthUserService(authUser: User): AuthUserService {
        return new AuthUserService(authUser);
    }

    public getRegisterUserUseCase(): RegisterUserUseCase {
        const registerUserUseCase = new RegisterUserUseCase(
            this.getAuthService(),
        );
        return registerUserUseCase;
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

    public getChangePasswordUseCase(authUser: User): ChangePasswordUseCase {
        const changePasswordUseCase = new ChangePasswordUseCase(
            this.getAuthUserService(authUser),
            this.getPasswordService(),
        );
        return changePasswordUseCase;
    }

    public getPerformCheckinUseCase(authUser: User): PerformCheckinUseCase {
        const performCheckinUseCase = new PerformCheckinUseCase(
            this.getAuthUserService(authUser),
            this.getAccessService()
        );
        return performCheckinUseCase;
    }

    public getPerformCheckoutUseCase(authUser: User): PerformCheckoutUseCase {
        const performCheckoutUseCase = new PerformCheckoutUseCase(
            this.getAuthUserService(authUser),
            this.getAccessService()
        );
        return performCheckoutUseCase;
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

    public getAutoCheckoutAllUseCase(authUser: User): AutoCheckoutAllUseCase {
        const autoCheckoutAllUseCase = new AutoCheckoutAllUseCase(
            this.getAuthUserService(authUser),
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
            this.getBookingRepository()
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
            this.getBookingRepository()
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

    public getListAvailableSlotsByDayUseCase(authUser: User): ListAvailableSlotsByDayUseCase {
        const listAvailableSlotsByDayUseCase = new ListAvailableSlotsByDayUseCase(
            this.getAuthUserService(authUser),
            this.getBookingService()
        );
        return listAvailableSlotsByDayUseCase;
    }

    public getSendBookingRemindersOfTomorrowUseCase(authUser: User): SendBookingRemindersOfTomorrowUseCase {
        const sendBookingRemindersOfTomorrowUseCase = new SendBookingRemindersOfTomorrowUseCase(
            this.getAuthUserService(authUser),
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

    public getDeleteUserUseCase(authUser: User): DeleteUserUseCase {
        return new DeleteUserUseCase(
            this.getAuthUserService(authUser),
            this.getUserRepository(),
        );
    }
    //#endregion
}

const container = new DiContainer();

export default container;
