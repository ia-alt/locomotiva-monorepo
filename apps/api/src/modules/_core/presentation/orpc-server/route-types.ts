import { authMiddleware } from './auth-middleware';
import { baseRouter } from './base';

export const publicRoute = baseRouter;

export const protectedRoute = publicRoute.use(authMiddleware)