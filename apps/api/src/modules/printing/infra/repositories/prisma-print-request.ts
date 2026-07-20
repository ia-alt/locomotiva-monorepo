import { PrintRequestRepository } from "@printing/domain/repositories";
import { PrintRequest } from "@printing/domain/entities";
import { UniqueId, DomainEvents } from "@core/base-classes";
import { PaginatedResult } from "@core/value-objects";
import { PrismaClient, Prisma, PrintRequest as PrintRequestDb } from "@core/infra/database/prisma";
import { storedFileDbToEntity } from "@storage/infra/repositories";

export class PrismaPrintRequestRepository implements PrintRequestRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async save(printRequest: PrintRequest): Promise<void> {
        const data = printRequest.toJSON();

        const payload = {
            userId: data.userId,
            printerId: data.printerId,
            purpose: data.purpose,
            stlFileId: data.stlFileId,
            gcodeFileId: data.gcodeFileId,
            filamentId: data.filamentId,
            status: data.status,
            rejectionCancelReason: data.rejectionCancelReason,
        };

        await this.prisma.printRequest.upsert({
            where: { id: data.id },
            update: payload,
            create: { id: data.id, ...payload },
        });

        DomainEvents.dispatchEventsForAggregate(printRequest.id);
    }

    async findById(id: UniqueId): Promise<PrintRequest | null> {
        const row = await this.prisma.printRequest.findUnique({ where: { id: id.value } });
        if (!row) return null;
        return this.printRequestDbToEntity(row);
    }


    async findMany(params: PrintRequestRepository.FindParams): Promise<PaginatedResult<typeof PrintRequest.JsonSchema, PrintRequest>> {
        const { take, skip } = params.pagination.asTakeSkip;
        const where: Prisma.PrintRequestWhereInput = {};

        if (params.filter?.status) {
            where.status = { in: params.filter.status };
        }
        if (params.filter?.printerId) {
            where.printerId = params.filter.printerId;
        }
        if (params.filter?.search) {
            where.userId = { in: params.filter!.usersIds!.map(x => x.toString()) };
        }

        const [rows, total] = await Promise.all([
            this.prisma.printRequest.findMany({ where, orderBy: { createdAt: "desc" }, take, skip }),
            this.prisma.printRequest.count({ where }),
        ]);

        const items = rows.map((row) => this.printRequestDbToEntity(row));
        return PaginatedResult.create<typeof PrintRequest.JsonSchema, PrintRequest>({
            items,
            total,
            paginatedQuery: params.pagination,
        });
    }

    async findInProductionByPrinterId(printerId: UniqueId): Promise<PrintRequest | null> {
        const row = await this.prisma.printRequest.findFirst({
            where: { printerId: printerId.value, status: PrintRequest.Status.IN_PRODUCTION },
        });
        if (!row) return null;
        return this.printRequestDbToEntity(row);
    }

    async findAllInProduction(): Promise<PrintRequest[]> {
        const rows = await this.prisma.printRequest.findMany({
            where: { status: PrintRequest.Status.IN_PRODUCTION },
        });
        return rows.map((row) => this.printRequestDbToEntity(row));
    }

    async existsActiveByPrinterId(printerId: UniqueId): Promise<boolean> {
        const count = await this.prisma.printRequest.count({
            where: {
                printerId: printerId.value,
                status: { in: [PrintRequest.Status.APPROVED, PrintRequest.Status.IN_PRODUCTION] },
            },
        });
        return count > 0;
    }

    async existsByFilamentId(filamentId: UniqueId): Promise<boolean> {
        const count = await this.prisma.printRequest.count({
            where: { filamentId: filamentId.value },
        });
        return count > 0;
    }

    private printRequestDbToEntity(row: PrintRequestDb): PrintRequest {
        return new PrintRequest(
            UniqueId.fromString(row.id),
            UniqueId.fromString(row.userId),
            row.printerId ? UniqueId.fromString(row.printerId) : null,
            row.purpose,
            UniqueId.fromString(row.stlFileId),
            UniqueId.fromString(row.gcodeFileId),
            UniqueId.fromString(row.filamentId),
            PrintRequest.StatusSchema.parse(row.status),
            row.rejectionCancelReason ?? null,
            new Date(row.createdAt),
            new Date(row.updatedAt),
        );
    }
}
