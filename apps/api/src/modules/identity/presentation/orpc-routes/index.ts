import { getMeRoute } from "./routes/get-me";
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

export const identyRoutes = {
    registerUser: registerUserRoute,
    getMe: getMeRoute,
    login: loginRoute,
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
};