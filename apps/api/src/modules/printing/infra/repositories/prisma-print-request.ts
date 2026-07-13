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

    async findByUserId(params: PrintRequestRepository.FindByUserParams): Promise<PaginatedResult<typeof PrintRequest.JsonSchema, PrintRequest>> {
        const { take, skip } = params.pagination.asTakeSkip;
        const where: Prisma.PrintRequestWhereInput = { userId: params.userId.value };
        if (params.status) {
            where.status = { in: params.status };
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

    async findAllAdmin(params: PrintRequestRepository.FindAllAdminParams): Promise<PaginatedResult<typeof PrintRequestRepository.AdminItemSchema, PrintRequestRepository.AdminItem>> {
        const { take, skip } = params.pagination.asTakeSkip;
        const where: Prisma.PrintRequestWhereInput = {};

        if (params.filter?.status) {
            where.status = { in: params.filter.status };
        }
        if (params.filter?.printerId) {
            where.printerId = params.filter.printerId;
        }
        if (params.filter?.search) {
            const matchingUsers = await this.prisma.user.findMany({
                where: { name: { contains: params.filter.search, mode: "insensitive" } },
                select: { id: true },
            });
            where.userId = { in: matchingUsers.map((u) => u.id) };
        }

        const [rows, total] = await Promise.all([
            this.prisma.printRequest.findMany({ where, orderBy: { createdAt: "desc" }, take, skip }),
            this.prisma.printRequest.count({ where }),
        ]);

        const items = await this.enrich(rows);
        return PaginatedResult.create<typeof PrintRequestRepository.AdminItemSchema, PrintRequestRepository.AdminItem>({
            items,
            total,
            paginatedQuery: params.pagination,
        });
    }

    /** O pedido guarda só ids — o item do admin busca usuário, impressora, arquivos e filamento num lote por página. */
    private async enrich(rows: PrintRequestDb[]): Promise<PrintRequestRepository.AdminItem[]> {
        if (rows.length === 0) return [];

        const userIds = [...new Set(rows.map((r) => r.userId))];
        const printerIds = [...new Set(rows.map((r) => r.printerId).filter((x): x is string => !!x))];
        const fileIds = [...new Set(rows.flatMap((r) => [r.stlFileId, r.gcodeFileId]))];
        const filamentIds = [...new Set(rows.map((r) => r.filamentId))];

        const [users, printers, files, filaments] = await Promise.all([
            this.prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } }),
            printerIds.length > 0
                ? this.prisma.printer.findMany({ where: { id: { in: printerIds } }, select: { id: true, name: true } })
                : Promise.resolve([]),
            this.prisma.file.findMany({ where: { id: { in: fileIds } } }),
            this.prisma.filament.findMany({ where: { id: { in: filamentIds } } }),
        ]);

        const userMap = new Map(users.map((u) => [u.id, u]));
        const printerMap = new Map(printers.map((p) => [p.id, p]));
        const fileMap = new Map(files.map((f) => [f.id, storedFileDbToEntity(f)]));
        const filamentNameMap = new Map(filaments.map((f) => [f.id, f.name]));

        return rows.map((row) => {
            const entity = this.printRequestDbToEntity(row);
            const json = entity.toJSON();
            const stlFile = fileMap.get(row.stlFileId);
            const gcodeFile = fileMap.get(row.gcodeFileId);
            if (!stlFile || !gcodeFile) {
                throw new Error(`Arquivos do pedido de impressão ${row.id} não encontrados no storage.`);
            }

            return new PrintRequestRepository.AdminItem({
                id: json.id,
                user: {
                    id: json.userId,
                    name: userMap.get(json.userId)?.name ?? "Usuário desconhecido",
                    email: userMap.get(json.userId)?.email ?? "",
                },
                printer: json.printerId
                    ? { id: json.printerId, name: printerMap.get(json.printerId)?.name ?? "Impressora desconhecida" }
                    : null,
                purpose: json.purpose,
                stlFile: stlFile.toJSON(),
                gcodeFile: gcodeFile.toJSON(),
                material: filamentNameMap.get(row.filamentId) ?? "desconhecido",
                status: json.status,
                rejectionCancelReason: json.rejectionCancelReason,
                createdAt: json.createdAt,
            });
        });
    }

    async findInProductionByPrinter(printerId: UniqueId): Promise<PrintRequest | null> {
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

    async existsActiveByPrinter(printerId: UniqueId): Promise<boolean> {
        const count = await this.prisma.printRequest.count({
            where: {
                printerId: printerId.value,
                status: { in: [PrintRequest.Status.APPROVED, PrintRequest.Status.IN_PRODUCTION] },
            },
        });
        return count > 0;
    }

    async existsByFilament(filamentId: UniqueId): Promise<boolean> {
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
