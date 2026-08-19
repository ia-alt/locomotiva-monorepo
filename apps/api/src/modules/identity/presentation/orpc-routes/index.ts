import { getMeRoute } from "./routes/get-me";
import { updateMeRoute } from "./routes/update-me";
import { loginRoute } from "./routes/login";
import { registerUserRoute } from "./routes/register-user";
import { requestPasswordResetRoute } from "./routes/request-password-reset";
import { changePasswordRoute } from "./routes/change-password";
import { executePasswordResetRoute } from "./routes/execute-password-reset";
import { listUsersRoute } from "./routes/list-users";
import { updateUserRoute } from "./routes/update-user";
import { deleteUserRoute } from "./routes/delete-user";
import { createApiKeyRoute } from "./routes/create-api-key";
import { listApiKeysRoute } from "./routes/list-api-keys";
import { revokeApiKeyRoute } from "./routes/revoke-api-key";
import { requestPasswordResetCodeRoute } from "./routes/request-password-reset-code";
import { verifyPasswordResetCodeRoute } from "./routes/verify-password-reset-code";
import { executePasswordResetWithCodeRoute } from "./routes/execute-password-reset-with-code";
import { getApiKeyInfoRoute } from "./routes/get-api-key-info";
import { getGovbrStatusRoute } from "./routes/get-govbr-status";
import { getGovbrLogoutUrlRoute } from "./routes/get-govbr-logout-url";
import { startGovbrLoginRoute } from "./routes/start-govbr-login";
import { completeGovbrLoginRoute } from "./routes/complete-govbr-login";
import { linkGovbrToAccountRoute } from "./routes/link-govbr-to-account";
import { completeGovbrRegistrationRoute } from "./routes/complete-govbr-registration";

export const identyRoutes = {
    registerUser: registerUserRoute,
    getMe: getMeRoute,
    updateMe: updateMeRoute,
    login: loginRoute,
    getGovbrStatus: getGovbrStatusRoute,
    getGovbrLogoutUrl: getGovbrLogoutUrlRoute,
    startGovbrLogin: startGovbrLoginRoute,
    completeGovbrLogin: completeGovbrLoginRoute,
    linkGovbrToAccount: linkGovbrToAccountRoute,
    completeGovbrRegistration: completeGovbrRegistrationRoute,
    requestPasswordReset: requestPasswordResetRoute,
    changePassword: changePasswordRoute,
    executePasswordReset: executePasswordResetRoute,
    listUsers: listUsersRoute,
    updateUser: updateUserRoute,
    deleteUser: deleteUserRoute,
    createApiKey: createApiKeyRoute,
    listApiKeys: listApiKeysRoute,
    revokeApiKey: revokeApiKeyRoute,
    requestPasswordResetCode: requestPasswordResetCodeRoute,
    verifyPasswordResetCode: verifyPasswordResetCodeRoute,
    executePasswordResetWithCode: executePasswordResetWithCodeRoute,
    getApiKeyInfo: getApiKeyInfoRoute,
};