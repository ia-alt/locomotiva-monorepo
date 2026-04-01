import { authMiddleware } from './auth-middleware';
import { systemAuthMiddleware } from './system-auth-middleware';
import { baseRouter } from './base';

export const publicRoute = baseRouter;

export const protectedRoute = publicRoute.use(authMiddleware);

export const systemRoute = publicRoute.use(systemAuthMiddleware);