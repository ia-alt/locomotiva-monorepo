import { baseRouter } from './base';
import { ORPCError } from '@orpc/server'
import container from "@di/container";
import * as crypto from "crypto";

export const systemAuthMiddleware = baseRouter.middleware(async ({ context, next }) => {
    const apiKeyHeader = context.headers.get("x-api-key");

    if (!apiKeyHeader) {
        console.log('[SystemAuthMiddleware] No x-api-key found in header');
        throw new ORPCError('UNAUTHORIZED')
    }

    const keyHash = crypto.createHash('sha256').update(apiKeyHeader.trim()).digest('hex');
    const apiKeyRepository = container.getApiKeyRepository();
    
    const apiKey = await apiKeyRepository.findByKeyHash(keyHash);

    if (!apiKey) {
        console.log('[SystemAuthMiddleware] Verification failed for api key');
        throw new ORPCError('UNAUTHORIZED')
    }

    // Adds apiKey and isSystem to the context
    return next({
        context: {
            apiKey,
            isSystem: true,
            // To be compatible with routers that might check user although they shouldn't
            // Wait, we probably don't need user here as system routes shouldn't need User.
        },
    })
})
