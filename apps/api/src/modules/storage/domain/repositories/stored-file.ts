import { UniqueId } from "@core/base-classes";
import { StoredFile } from "@storage/domain/entities";

interface StoredFileRepository {
    save(file: StoredFile): Promise<void>;
    findById(id: UniqueId): Promise<StoredFile | null>;
}

export { StoredFileRepository };
