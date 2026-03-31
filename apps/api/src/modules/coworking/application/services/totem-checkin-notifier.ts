export interface TotemCheckinNotifier {
    notify(totemName: string, userName: string): Promise<void>;
}