import { Filament } from "@printing/domain/entities";
import { UniqueId } from "@core/base-classes";

interface FilamentRepository {
    save(filament: Filament): Promise<void>;
    findAll(): Promise<Filament[]>;
    findById(id: UniqueId): Promise<Filament | null>;
    findByName(name: string): Promise<Filament | null>;
    delete(id: UniqueId): Promise<void>;
}

export { FilamentRepository };
