import { UniqueId } from "@core/base-classes";

export interface TotemCheckinNotifier {
    notify(totemId: UniqueId): Promise<void>;
}