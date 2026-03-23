import { Entity, UniqueId } from "@core/base-classes";
import { OnlyDate } from "@core/value-objects";
import { DailyAvailability, OperatingHoursPolicy, OperatingHoursOverride } from "@operating-hours/domain/value-objects";
import z from "zod";

class SpaceOperatingHours extends Entity {

    constructor(
        private readonly spaceId: UniqueId,
        private policies: OperatingHoursPolicy[],
        private overrides: OperatingHoursOverride[]
    ) {
        super(spaceId);
        this.sortPolicies();
    }

    public static create(spaceId: UniqueId): SpaceOperatingHours {
        return new SpaceOperatingHours(spaceId, [], []);
    }

    getAvailabilityForDay(date: OnlyDate): DailyAvailability | null {
        const override = this.overrides.find(o => o.value.date.equals(date));
        if (override) {
            return override.value.dailyAvailability;
        }

        const activePolicy = this.findPolicyForDate(date);
        if (!activePolicy) return null;

        const dayName = date.getDayOfWeekName();

        return activePolicy.getDay(dayName);
    }

    private findPolicyForDate(date: OnlyDate): OperatingHoursPolicy | undefined {
        return [...this.policies]
            .reverse()
            .find(p => date >= p.value.effectiveFrom);
    }

    private sortPolicies(): void {
        this.policies.sort((a, b) => a.value.effectiveFrom.valueOf() - b.value.effectiveFrom.valueOf());
    }

    // Métodos para garantir que novas políticas e overrides sejam adicionados consistentemente
    addPolicy(policy: OperatingHoursPolicy): void {
        this.policies.push(policy);
        this.sortPolicies();
    }

    addOverride(override: OperatingHoursOverride): void {
        this.overrides = this.overrides.filter(o => !o.value.date.equals(override.value.date));
        this.overrides.push(override);
    }

    hasOverrideForDay(date: OnlyDate): boolean {
        return this.overrides.some(o => o.value.date.equals(date));
    }

    toJSON(): SpaceOperatingHours.Json {
        return {
            spaceId: this.spaceId.toJSON(),
            policies: this.policies.map(p => p.toJSON()),
            overrides: this.overrides.map(o => o.toJSON()),
        };
    }

    static fromJSON(json: SpaceOperatingHours.Json): SpaceOperatingHours {
        return new SpaceOperatingHours(
            UniqueId.fromString(json.spaceId),
            json.policies.map(p => OperatingHoursPolicy.fromJSON(p)),
            json.overrides.map(o => OperatingHoursOverride.fromJSON(o))
        );
    }
}

namespace SpaceOperatingHours {
    export const JsonSchema = z.object({
        spaceId: UniqueId.JsonSchema,
        policies: z.array(OperatingHoursPolicy.JsonSchema),
        overrides: z.array(OperatingHoursOverride.JsonSchema),
    })

    export type Json = z.infer<typeof JsonSchema>;
}

export { SpaceOperatingHours };