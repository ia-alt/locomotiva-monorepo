import { systemRoute } from "@core/presentation/orpc-server/route-types";
import container from "src/modules/_di_container/container";
import { MemoryPublisherTotemCheckinNotifier } from "src/modules/coworking/infra/services/memory-publisher-totem-checkin-notifier";

export const onTotemCheckinRoute = systemRoute
    .handler(async function* ({ context, signal }) {
        const totemId = context.apiKey.id

        const totemCheckinNotifier = container.getTotemCheckinNotifier() as MemoryPublisherTotemCheckinNotifier;

        const iterator = totemCheckinNotifier.totemCheckinNotifierPublisher.subscribe(totemId.value, { signal })

        // for test
        setInterval(() => {
            totemCheckinNotifier.notify(totemId);
        }, 5000);

        for await (const payload of iterator) {
            yield payload;
        }
    });