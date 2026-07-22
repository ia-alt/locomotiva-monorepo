import { PrinterRepository } from "@printing/domain/repositories";
import { Printer } from "@printing/domain/entities";
import { UniqueId } from "@core/base-classes";
import { PrismaClient, Printer as PrinterDb } from "@core/infra/database/prisma";

export class PrismaPrinterRepository implements PrinterRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async save(printer: Printer): Promise<void> {
        const data = printer.toJSON();
        await this.prisma.printer.upsert({
            where: { id: data.id },
            update: {
                name: data.name,
                model: data.model,
                enabled: data.enabled,
                notes: data.notes,
            },
            create: {
                id: data.id,
                name: data.name,
                model: data.model,
                enabled: data.enabled,
                notes: data.notes,
            },
        });
    }

    async findAll(): Promise<Printer[]> {
        const printers = await this.prisma.printer.findMany({ orderBy: { name: "asc" } });
        return printers.map((printer) => this.printerDbToEntity(printer));
    }

    async findAllEnabled(): Promise<Printer[]> {
        const printers = await this.prisma.printer.findMany({ where: { enabled: true }, orderBy: { name: "asc" } });
        return printers.map((printer) => this.printerDbToEntity(printer));
    }

    async findById(id: UniqueId): Promise<Printer | null> {
        const printer = await this.prisma.printer.findUnique({ where: { id: id.value } });
        if (!printer) return null;
        return this.printerDbToEntity(printer);
    }

    async delete(id: UniqueId): Promise<void> {
        await this.prisma.printer.delete({ where: { id: id.value } });
    }

    private printerDbToEntity(printer: PrinterDb): Printer {
        return new Printer(
            UniqueId.fromString(printer.id),
            printer.name,
            printer.model,
            printer.enabled,
            printer.notes ?? null,
        );
    }
}
