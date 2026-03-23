import { getMeRoute } from "./routes/get-me";
import { loginRoute } from "./routes/login";
import { registerUserRoute } from "./routes/register-user";
import { requestPasswordResetRoute } from "./routes/request-password-reset";
import { changePasswordRoute } from "./routes/change-password";
import { executePasswordResetRoute } from "./routes/execute-password-reset";
import { listUsersRoute } from "./routes/list-users";
import { updateUserRoute } from "./routes/update-user";
import { deleteUserRoute } from "./routes/delete-user";

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
};