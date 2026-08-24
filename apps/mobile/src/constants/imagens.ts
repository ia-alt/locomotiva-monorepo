import { ImageSourcePropType } from 'react-native';

/**
 * Foto do espaço, usada quando ainda não há sala escolhida (tela "Selecionar Sala")
 * ou quando a sala não tem foto cadastrada no admin.
 *
 * Para trocar a imagem, basta substituir o arquivo em assets/foto_locomotiva.jpeg
 * ou apontar o require abaixo para outro arquivo de assets/.
 */
export const IMAGEM_PADRAO_SALA: ImageSourcePropType = require('../../assets/foto_locomotiva.jpeg');

/** Foto cadastrada da sala, caindo na foto do espaço quando não houver. */
export const fonteImagemSala = (photoUrl?: string | null): ImageSourcePropType =>
    photoUrl ? { uri: photoUrl } : IMAGEM_PADRAO_SALA;
