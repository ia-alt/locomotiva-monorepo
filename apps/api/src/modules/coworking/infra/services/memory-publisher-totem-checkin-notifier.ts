import { MemoryPublisher } from "@orpc/experimental-publisher/memory";
import { TotemCheckinNotifier } from "../../application/services/totem-checkin-notifier";

export class MemoryPublisherTotemCheckinNotifier implements TotemCheckinNotifier {
    public readonly totemCheckinNotifierPublisher: MemoryPublisher<Record<string, {}>>

    constructor() {
        this.totemCheckinNotifierPublisher = new MemoryPublisher<Record<string, {}>>()
    }

    notify(totemName: string): Promise<void> {
        this.totemCheckinNotifierPublisher.publish(totemName, {});
        return Promise.resolve();
    }
}
