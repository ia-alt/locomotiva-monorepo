import { PrintRequest } from "@printing/domain/entities";
import { StoredFile } from "@storage/domain/entities";
import { UniqueId } from "@core/base-classes";
import { PaginatedQuery, PaginatedResult } from "@core/value-objects";
import z from "zod";

interface PrintRequestRepository {
    save(printRequest: PrintRequest): Promise<void>;
    findById(id: UniqueId): Promise<PrintRequest | null>;
    findMany(params: PrintRequestRepository.FindParams): Promise<PaginatedResult<typeof PrintRequest.JsonSchema, PrintRequest>>;
    /** Pedido EM PRODUÇÃO numa impressora (para a regra de ocupação 1-por-impressora). */
    findInProductionByPrinterId(printerId: UniqueId): Promise<PrintRequest | null>;
    /** Todos os pedidos EM PRODUÇÃO (para marcar impressoras "em uso"). */
    findAllInProduction(): Promise<PrintRequest[]>;
    /** Há pedido ATIVO (aprovado ou em produção) vinculado à impressora? (guarda da exclusão) */
    existsActiveByPrinterId(printerId: UniqueId): Promise<boolean>;
    /** Há pedido (qualquer status) referenciando o filamento? (guarda da exclusão do catálogo) */
    existsByFilamentId(filamentId: UniqueId): Promise<boolean>;
}

namespace PrintRequestRepository {
    export type FindParams = {
        pagination: PaginatedQuery;
        filter?: {
            usersIds?: UniqueId[];
            status?: PrintRequest.Status[];
            printerId?: string;
            search?: string;
        };
    };
}

export { PrintRequestRepository };
