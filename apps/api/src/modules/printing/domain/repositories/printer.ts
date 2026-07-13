import { Printer } from "@printing/domain/entities";
import { UniqueId } from "@core/base-classes";

interface PrinterRepository {
    save(printer: Printer): Promise<void>;
    findAll(): Promise<Printer[]>;
    findAllEnabled(): Promise<Printer[]>;
    findById(id: UniqueId): Promise<Printer | null>;
    delete(id: UniqueId): Promise<void>;
}

export { PrinterRepository };
