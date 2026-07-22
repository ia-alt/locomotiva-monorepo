import * as DocumentPicker from 'expo-document-picker';
import { File as FileSystemFile } from 'expo-file-system';
import { Platform } from 'react-native';
import type { useORPC } from '../locomotiva-api/context';

type ORPC = ReturnType<typeof useORPC>;

export type PrintFileKind = 'stl' | 'gcode';

/** Referência do arquivo já registrado no storage (a API devolve id + nome). */
export type UploadedPrintFile = {
    id: string;
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

function hasValidExtension(name: string, kind: PrintFileKind): boolean {
    const n = name.trim().toLowerCase();
    return KIND_CONFIG[kind].extensions.some((ext) => n.endsWith(ext));
}


export async function pickAndUploadPrintFile(orpc: ORPC, kind: PrintFileKind): Promise<UploadedPrintFile | null> {
    const result = await DocumentPicker.getDocumentAsync({
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
    const file = webFile ?? (new FileSystemFile(asset.uri) as unknown as File);

    const uploaded = await orpc.storage.uploadFile.call({ file, fileName: asset.name });
    return { id: uploaded.id, fileName: uploaded.name, fileSizeBytes: uploaded.sizeBytes };
}
