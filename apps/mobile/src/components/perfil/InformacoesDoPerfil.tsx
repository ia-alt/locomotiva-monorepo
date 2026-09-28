import React from 'react';
import type { ORPCOutputs } from '../../locomotiva-api/types';
import { Cartao, LinhaDeInformacao } from '../../ui';
import { cpfFormatado, dataFormatada } from './formatos-do-perfil';

type Usuario = ORPCOutputs['identy']['getMe'];

/** Dados da conta. Empresa e cargo só aparecem quando preenchidos. */
export function InformacoesDoPerfil({ usuario }: { usuario: Usuario | null }) {
    return (
        <Cartao titulo="Informações">
            <LinhaDeInformacao icone="documento" rotulo="CPF" valor={cpfFormatado(usuario?.cpf)} />
            <LinhaDeInformacao icone="calendario" rotulo="Data de nascimento" valor={dataFormatada(usuario?.birthDate)} />
            <LinhaDeInformacao icone="email" rotulo="E-mail" valor={usuario?.email ?? '-'} />
            <LinhaDeInformacao icone="telefone" rotulo="Telefone" valor={usuario?.phone ?? 'Não informado'} />
            {usuario?.company ? (
                <LinhaDeInformacao icone="empresa" rotulo="Empresa/Instituição" valor={usuario.company} />
            ) : null}
            {usuario?.jobTitle ? <LinhaDeInformacao icone="perfil" rotulo="Cargo" valor={usuario.jobTitle} /> : null}
        </Cartao>
    );
}
