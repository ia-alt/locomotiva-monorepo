import { baseRouter } from './base';
import { ORPCError } from '@orpc/server'
import container from "@di/container";
import { AuthToken } from 'src/modules/identity/domain/value-objects/auth-token';

export const authMiddleware = baseRouter.middleware(async ({ context, next }) => {
    const authHeader = context.headers.get("authorization");

    let jwtToken = authHeader?.split(" ")[1] ?? undefined;

    if (jwtToken) {
        // Limpeza agressiva e explicita no middleware
        jwtToken = jwtToken.replace(/^['"]+|['"]+$/g, '').trim();
    }

    if (!jwtToken) {
        console.log('[AuthMiddleware] No token found in header');
        throw new ORPCError('UNAUTHORIZED')
    }


    const authToken = AuthToken.fromString(jwtToken)
    const user = await container.getAuthTokenService().verify(authToken);

    if (!user) {
        console.log('[AuthMiddleware] User verification failed for token');
        throw new ORPCError('UNAUTHORIZED')
    }

    // Adds session and user to the context
    return next({
        context: {
            user
        },
    })
})