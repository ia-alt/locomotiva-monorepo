import { systemRoute } from "@core/presentation/orpc-server/route-types";
import { eventIterator } from "@orpc/server";
import z from "zod";
import container from "src/modules/_di_container/container";
import { MemoryPublisherTotemCheckinNotifier } from "src/modules/coworking/infra/services/memory-publisher-totem-checkin-notifier";

export const totemCheckinRoute = systemRoute
    .output(eventIterator(z.object({ name: z.string() })))
    .handler(async function* ({ context, signal }) {
        const totemName = context.apiKey.name
        const topic = `login-${totemName}`;

        const totemCheckinNotifier = container.getTotemCheckinNotifier() as MemoryPublisherTotemCheckinNotifier;

        // O Totem se inscreve no seu tópico específico
        const iterator = totemCheckinNotifier.totemCheckinNotifierPublisher.subscribe(topic, { signal })

        // Fica aguardando eventos chegarem. 
        // O 'yield' envia a informação para o frontend em tempo real (SSE).
        for await (const payload of iterator) {
            yield payload;
        }
    });