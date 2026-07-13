import { PrintRequest } from "@printing/domain/entities";
import { StoredFile } from "@storage/domain/entities";
import { UniqueId } from "@core/base-classes";
import { PaginatedQuery, PaginatedResult } from "@core/value-objects";
import z from "zod";

interface PrintRequestRepository {
    save(printRequest: PrintRequest): Promise<void>;
    findById(id: UniqueId): Promise<PrintRequest | null>;
    findByUserId(params: PrintRequestRepository.FindByUserParams): Promise<PaginatedResult<typeof PrintRequest.JsonSchema, PrintRequest>>;
    findAllAdmin(params: PrintRequestRepository.FindAllAdminParams): Promise<PaginatedResult<typeof PrintRequestRepository.AdminItemSchema, PrintRequestRepository.AdminItem>>;
    /** Pedido EM PRODUÇÃO numa impressora (para a regra de ocupação 1-por-impressora). */
    findInProductionByPrinter(printerId: UniqueId): Promise<PrintRequest | null>;
    /** Todos os pedidos EM PRODUÇÃO (para marcar impressoras "em uso"). */
    findAllInProduction(): Promise<PrintRequest[]>;
    /** Há pedido ATIVO (aprovado ou em produção) vinculado à impressora? (guarda da exclusão) */
    existsActiveByPrinter(printerId: UniqueId): Promise<boolean>;
    /** Há pedido (qualquer status) referenciando o filamento? (guarda da exclusão do catálogo) */
    existsByFilament(filamentId: UniqueId): Promise<boolean>;
}

namespace PrintRequestRepository {
    export type FindByUserParams = {
        userId: UniqueId;
        pagination: PaginatedQuery;
        status?: PrintRequest.Status[];
    };

    export type FindAllAdminParams = {
        pagination: PaginatedQuery;
        filter?: {
            status?: string[];
            printerId?: string;
            search?: string;
        };
    };

    export const AdminItemSchema = z.object({
        id: z.string(),
        user: z.object({ id: z.string(), name: z.string(), email: z.string() }),
        printer: z.object({ id: z.string(), name: z.string() }).nullable(),
        purpose: z.string(),
        stlFile: StoredFile.JsonSchema,
        gcodeFile: StoredFile.JsonSchema,
        material: z.string(),
        status: z.string(),
        rejectionCancelReason: z.string().nullable(),
        createdAt: z.string(),
    });

    export class AdminItem {
        constructor(private readonly data: z.infer<typeof AdminItemSchema>) { }
        toJSON() {
            return this.data;
        }
    }
}

export { PrintRequestRepository };
