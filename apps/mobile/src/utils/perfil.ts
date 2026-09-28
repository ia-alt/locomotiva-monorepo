import { ORPCOutputs } from '../locomotiva-api/types';

type Usuario = ORPCOutputs['identy']['getMe'];

/** Reservar sala e pedir impressão exigem empresa, cargo, telefone e data de nascimento. */
export function perfilEstaCompleto(usuario: Usuario | null | undefined): boolean {
    return !!usuario?.company && !!usuario?.jobTitle && !!usuario?.phone && !!usuario?.birthDate;
}
