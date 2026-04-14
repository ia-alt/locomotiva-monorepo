import { DomainEvents } from "@core/base-classes";
import { UserRepository } from "src/modules/identity/domain/repositories";
import { CheckinDoneEvent } from "../../domain/events/checkin-done";
import { TotemCheckinNotifier } from "../services/totem-checkin-notifier";

export class AfterUserCheckin {
    constructor(
        private readonly totemCheckinNotifier: TotemCheckinNotifier,
    ) {
        this.setupSubscriptions();
    }

    private setupSubscriptions(): void {
        DomainEvents.register(this.onUserCheckin.bind(this), CheckinDoneEvent.name);
    }

    private async onUserCheckin(event: CheckinDoneEvent): Promise<void> {
        try {
            const { accessLog } = event;
            if (!accessLog.checkinTotemId) return;

            this.totemCheckinNotifier.notify(accessLog.checkinTotemId);

            console.log(`[AfterUserCheckin] Notificação enviada para totem ${accessLog.checkinTotemId}`);
        } catch (error) {
            console.error('[AfterUserCheckin] Error sending notification:', error);
        }
    }
}
