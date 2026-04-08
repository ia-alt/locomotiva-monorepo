import { MemoryPublisher } from "@orpc/experimental-publisher/memory";
import { TotemCheckinNotifier } from "../../application/services/totem-checkin-notifier";
import { UniqueId } from "src/modules/_core/base-classes";

export class MemoryPublisherTotemCheckinNotifier implements TotemCheckinNotifier {
    public readonly totemCheckinNotifierPublisher: MemoryPublisher<Record<string, {}>>

    constructor() {
        this.totemCheckinNotifierPublisher = new MemoryPublisher<Record<string, {}>>()
    }

    notify(totemId: UniqueId): Promise<void> {
        this.totemCheckinNotifierPublisher.publish(totemId.value, {});
        return Promise.resolve();
    }
}
