import { systemRoute } from "@core/presentation/orpc-server/route-types";
import container from "src/modules/_di_container/container";
import { MemoryPublisherTotemCheckinNotifier } from "src/modules/coworking/infra/services/memory-publisher-totem-checkin-notifier";

export const onTotemCheckinRoute = systemRoute
    .handler(async function* ({ context, signal }) {
        const totemName = context.apiKey.name

        const totemCheckinNotifier = container.getTotemCheckinNotifier() as MemoryPublisherTotemCheckinNotifier;

        const iterator = totemCheckinNotifier.totemCheckinNotifierPublisher.subscribe(totemName, { signal })

        // for test — interval é limpo quando a conexão fecha
        const testInterval = setInterval(() => {
            totemCheckinNotifier.notify(totemName);
        }, 40000);

        try {
            for await (const payload of iterator) {
                yield payload;
            }
        } finally {
            clearInterval(testInterval)
        }
    });