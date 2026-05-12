import { AccessLog } from "../entities";
import { PaginatedQuery, PaginatedResult, OnlyDate } from "@core/value-objects";
import { UniqueId } from "@core/base-classes";

export interface AccessLogRepository {
    save(log: AccessLog): Promise<void>;
    saveMany(logs: AccessLog[]): Promise<void>;
    findById(id: UniqueId): Promise<AccessLog | null>;
    findByUserIdAndActive(userId: UniqueId): Promise<AccessLog | null>;
    findAllActive(): Promise<AccessLog[]>;
    findEntriesSince(since: Date): Promise<AccessLog[]>;
    findEntriesInRange(from: Date, to: Date): Promise<AccessLog[]>;
    findHistoryByUserId(userId: UniqueId, pagination: PaginatedQuery): Promise<PaginatedResult<typeof AccessLog.JsonSchema, AccessLog>>;
    findAllHistory(pagination: PaginatedQuery): Promise<PaginatedResult<typeof AccessLog.JsonSchema, AccessLog>>;
    findAllByDay(day: OnlyDate): Promise<AccessLog[]>;
}
