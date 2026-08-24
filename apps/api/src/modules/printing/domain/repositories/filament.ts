import { Filament } from "@printing/domain/entities";
import { UniqueId } from "@core/base-classes";

interface FilamentRepository {
    save(filament: Filament): Promise<void>;
    /** Todo o catálogo, incluindo desativados (uso administrativo / resolução de histórico). */
    findAll(): Promise<Filament[]>;
    /** Apenas os ativos — é o que o cliente pode escolher ao pedir. */
    findAllActive(): Promise<Filament[]>;
    findById(id: UniqueId): Promise<Filament | null>;
    findByName(name: string): Promise<Filament | null>;
    delete(id: UniqueId): Promise<void>;
}

export { FilamentRepository };
