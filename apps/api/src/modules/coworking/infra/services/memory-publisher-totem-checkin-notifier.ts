import { MemoryPublisher } from "@orpc/experimental-publisher/memory";
import { TotemCheckinNotifier } from "../../application/services/totem-checkin-notifier";

export class MemoryPublisherTotemCheckinNotifier implements TotemCheckinNotifier {
    public readonly totemCheckinNotifierPublisher: MemoryPublisher<Record<string, { name: string }>>

    constructor() {
        this.totemCheckinNotifierPublisher = new MemoryPublisher<Record<string, { name: string }>>()
    }

    notify(totemName: string, userName: string): Promise<void> {
        this.totemCheckinNotifierPublisher.publish(totemName, { name: userName });
        return Promise.resolve();
    }
}
