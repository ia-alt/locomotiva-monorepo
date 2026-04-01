import { systemRoute } from "@core/presentation/orpc-server/route-types";
import z from "zod";

export const getApiKeyInfoRoute = systemRoute
    .route({ method: "GET", path: "/api-keys/me" })
    .output(z.object({ name: z.string() }))
    .handler(async ({ context }) => {
        return { name: context.apiKey.name };
    });
