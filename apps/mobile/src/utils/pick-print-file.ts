import * as DocumentPicker from 'expo-document-picker';
import { File as FileSystemFile } from 'expo-file-system';
import { Platform } from 'react-native';

export type PrintFileKind = 'stl' | 'gcode';

/** Metadados do arquivo escolhido — é o que viaja nos params da navegação. */
export type PickedPrintFile = {
    fileName: string;
    fileSizeBytes: number | null;
};

const KIND_CONFIG: Record<PrintFileKind, { extensions: string[]; pickerTypes: string[]; errorMessage: string }> = {
    stl: {
        extensions: ['.stl'],
        // no web o expo-document-picker joga esses valores direto no accept do <input>,
        // então as extensões bloqueiam arquivos errados já no organizador de arquivos
        pickerTypes: ['model/stl', 'application/sla', '.stl'],
        errorMessage: 'O arquivo precisa ser um .stl (modelo 3D).',
    },
    gcode: {
        extensions: ['.gcode', '.gco'],
        pickerTypes: ['text/x.gcode', 'text/x-gcode', '.gcode', '.gco'],
        errorMessage: 'O arquivo precisa ser um .gcode (modelo fatiado, pronto para impressão).',
    },
};

/**
 * O arquivo só sobe para o storage quando o pedido é enviado de fato (a rota
 * `requestPrint` recebe os dois arquivos junto com os dados). Até lá ele fica
 * aqui: um `File` não é serializável e não pode viajar nos params da navegação.
 */
const pickedFiles = new Map<PrintFileKind, File>();

function hasValidExtension(name: string, kind: PrintFileKind): boolean {
    const n = name.trim().toLowerCase();
    return KIND_CONFIG[kind].extensions.some((ext) => n.endsWith(ext));
}

export function getPickedFile(kind: PrintFileKind): File | null {
    return pickedFiles.get(kind) ?? null;
}

export function clearPickedFiles(): void {
    pickedFiles.clear();
}

/** Escolhe o arquivo e valida a extensão — nada é enviado à API aqui. */
export async function pickPrintFile(kind: PrintFileKind): Promise<PickedPrintFile | null> {
    const result = await DocumentPicker.getDocumentAsync({
        // o arquivo precisa continuar acessível até o envio, no fim do fluxo
        copyToCacheDirectory: true,
        multiple: false,
        ...(Platform.OS === 'web' ? { type: KIND_CONFIG[kind].pickerTypes } : {}),
    });
    if (result.canceled || !result.assets?.[0]) return null;

    const asset = result.assets[0];
    if (!hasValidExtension(asset.name, kind)) {
        throw new Error(KIND_CONFIG[kind].errorMessage);
    }

    const webFile = (asset as { file?: File }).file;
    pickedFiles.set(kind, webFile ?? (new FileSystemFile(asset.uri) as unknown as File));

    return { fileName: asset.name, fileSizeBytes: asset.size ?? null };
}
