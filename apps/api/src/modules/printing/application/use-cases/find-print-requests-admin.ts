import { UniqueId, UseCase } from "@core/base-classes";
import { FilamentRepository, PrinterRepository, PrintRequestRepository } from "@printing/domain/repositories";
import { PaginatedQuery, PaginatedResult } from "@core/value-objects";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { UserRepository } from "src/modules/identity/domain/repositories";
import { Filament, Printer, PrintRequest } from "../../domain/entities";
import { StoredFileRepository } from "src/modules/storage/domain/repositories";
import { FilamentNotFoundError, PrinterNotFoundError } from "../errors";
import { FileNotFoundError } from "src/modules/storage/domain/errors";
import { StoredFile } from "src/modules/storage/domain/entities";
import { UserNotFoundError } from "src/modules/identity/domain/errors";
import { User } from "src/modules/identity/domain/entities";

class FindPrintRequestsAdminUseCase extends UseCase<FindPrintRequestsAdminUseCase.Input, FindPrintRequestsAdminUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly printRequestRepository: PrintRequestRepository,
        private readonly userRepository: UserRepository,
        private readonly printerRepository: PrinterRepository,
        private readonly filamentRepository: FilamentRepository,
        private readonly storedFileRepository: StoredFileRepository,

    ) {
        super();
    }

    async execute(params: FindPrintRequestsAdminUseCase.Input): Promise<FindPrintRequestsAdminUseCase.Output> {
        this.authUserService.checkIsAdmin();
        //
        const usersOfFilter = params.filter?.search ? await this.userRepository.findManyByName(params.filter.search) : null;
        const usersIds: UniqueId[] | undefined = usersOfFilter?.map(u => u.id);

        const statusFilter = params.filter?.status ? params.filter?.status.map(s => PrintRequest.StatusSchema.parse(s)) : undefined;
        
        const result = await this.printRequestRepository.findMany({
            pagination: PaginatedQuery.create(params.pagination),
            filter: {
                printerId: params.filter?.printerId,
                status: statusFilter,
                usersIds,
            },
        });

        const [users, printers, filaments, files] = await Promise.all([
            this.userRepository.findManyByIds(result.value.items.map(pr => pr.userId)),
            this.printerRepository.findAll(),
            this.filamentRepository.findAll(),
            this.storedFileRepository.findManyByIds(result.value.items.flatMap(pr => [pr.stlFileId, pr.gcodeFileId])),
        ]);

        const items: FindPrintRequestsAdminUseCase.OutputItem[] = result.value.items.map(pr => {

            let printer: Printer | null = null;
            if (pr.printerId !== null) {
                const foundPrinter = printers.find(f => f.id.equals(pr.printerId!));
                if (!foundPrinter) throw new PrinterNotFoundError(pr.printerId);
                printer = foundPrinter;
            }

            const filament = filaments.find(f => f.id.equals(pr.filamentId));
            if(!filament) throw new FilamentNotFoundError(pr.filamentId);
            const stlFile = files.find(f => f.id.equals(pr.stlFileId));
            if (!stlFile) throw new FileNotFoundError(pr.stlFileId);
            const gcodeFile = files.find(f => f.id.equals(pr.gcodeFileId));
            if (!gcodeFile) throw new FileNotFoundError(pr.gcodeFileId);
            const user = users.find(u => u.id.equals(pr.userId))
            if (!user) throw new UserNotFoundError();
            
            const item: FindPrintRequestsAdminUseCase.OutputItem = {
                ...pr.toJSON(),
                user: user.toJSON(),
                printer: printer?.toJSON() ?? null,
                stlFile: stlFile.toJSON(),
                gcodeFile: gcodeFile.toJSON(),
                filament: filament.toJSON(),
            };

            return item;
        });

        const output: FindPrintRequestsAdminUseCase.Output = {
            ...result.toJSON(),
            items,
        };

        return output
    }
}

namespace FindPrintRequestsAdminUseCase {
    const FilterSchema = z.object({
        status: z.array(z.string()).optional(),
        printerId: z.string().optional(),
        search: z.string().optional(),
    });

    export const InputSchema = z.object({
        pagination: PaginatedQuery.Schema,
        filter: FilterSchema.optional(),
    });

    export const OutputItemSchema = PrintRequest.JsonSchema.extend({
        user: User.JsonSchema,
        printer: Printer.JsonSchema.nullable(), 
        stlFile: StoredFile.JsonSchema,
        gcodeFile: StoredFile.JsonSchema,
        filament: Filament.JsonSchema,
    });

    export const OutputSchema = PaginatedResult.JsonSchema(OutputItemSchema);

    export type Input = z.infer<typeof InputSchema>;
    export type OutputItem = z.infer<typeof OutputItemSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { FindPrintRequestsAdminUseCase };
