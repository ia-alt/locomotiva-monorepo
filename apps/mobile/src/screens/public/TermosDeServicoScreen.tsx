import React from 'react';
import { usePublicStackNavigation } from '../../navigation/PublicNavigator';
import { DocumentoLegal, Negrito, Paragrafo, SecaoDoDocumento } from '../../components/acesso/DocumentoLegal';

export default function TermosDeServicoScreen() {
    const navigation = usePublicStackNavigation();

    return (
        <DocumentoLegal titulo="Termos de Serviço" atualizadoEm="23 de abril de 2026" onVoltar={() => navigation.pop()}>
            <SecaoDoDocumento titulo="1. Identificação do Controlador">
                <Paragrafo>
                    O aplicativo <Negrito>Locomotiva Hub</Negrito> é operado pela{' '}
                    <Negrito>Secretaria de Estado da Ciência, Tecnologia e Inovação – SECTI</Negrito>,
                    pessoa jurídica de direito público, inscrita no CNPJ sob o n.º 05.572.043/0001-65,
                    com sede na Avenida dos Holandeses, 9 – Calhau, São Luís – MA, CEP 65.071-380.
                </Paragrafo>
                <Paragrafo>
                    Os espaços disponibilizados para reserva estão localizados na{' '}
                    <Negrito>Av. José Sarney, 137 – Centro, São Luís – MA, CEP 65010-520</Negrito>.
                </Paragrafo>
                <Paragrafo>
                    Contato: ouvidoria@secti.ma.gov.br | locomotivahub@gmail.com
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="2. Objeto">
                <Paragrafo>
                    Estes Termos de Serviço ("Termos") regulam o acesso e o uso do aplicativo
                    Locomotiva Hub, plataforma digital gratuita destinada ao agendamento e gerenciamento
                    de reservas de espaços (salas, laboratórios e áreas de uso compartilhado)
                    administrados pela SECTI.
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="3. Aceitação dos Termos">
                <Paragrafo>
                    Ao criar uma conta ou utilizar o aplicativo, o usuário declara ter lido,
                    compreendido e concordado integralmente com estes Termos. Caso não concorde
                    com qualquer disposição, deve abster-se de utilizar o serviço.
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="4. Público-Alvo e Idade Mínima">
                <Paragrafo>
                    O Locomotiva Hub é aberto a qualquer pessoa física interessada em utilizar
                    os espaços administrados pela SECTI. O cadastro é permitido a partir de{' '}
                    <Negrito>16 (dezesseis) anos de idade</Negrito>. Usuários entre 16 e 17 anos são
                    considerados relativamente capazes, nos termos do Código Civil brasileiro.
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="5. Cadastro e Conta de Usuário">
                <Paragrafo>
                    5.1. Para utilizar os recursos do aplicativo, o usuário deve criar uma conta
                    fornecendo: nome completo, e-mail, CPF, data de nascimento e telefone. Os campos{' '}
                    <Negrito>Empresa/Instituição</Negrito> e <Negrito>Cargo</Negrito> são opcionais e podem
                    ser preenchidos voluntariamente para identificação do vínculo institucional
                    do usuário.
                </Paragrafo>
                <Paragrafo>
                    5.2. O usuário é responsável pela veracidade, atualidade e exatidão das
                    informações fornecidas, bem como pela guarda de suas credenciais de acesso.
                </Paragrafo>
                <Paragrafo>
                    5.3. É vedado o compartilhamento de credenciais com terceiros. Qualquer acesso
                    realizado mediante as credenciais do usuário será considerado de sua
                    responsabilidade.
                </Paragrafo>
                <Paragrafo>
                    5.4. O uso do CPF tem por finalidade a identificação inequívoca do usuário
                    e a autenticação de determinadas operações na plataforma.
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="6. Gratuidade do Serviço">
                <Paragrafo>
                    O acesso ao Locomotiva Hub e a utilização de todas as suas funcionalidades
                    são inteiramente <Negrito>gratuitos</Negrito>. Não há planos pagos, assinaturas ou
                    cobranças de qualquer natureza.
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="7. Reservas de Espaços">
                <Paragrafo>
                    7.1. O usuário pode realizar reservas de espaços disponíveis por meio do
                    aplicativo, sujeitas à disponibilidade e às regras de uso de cada local.
                </Paragrafo>
                <Paragrafo>
                    7.2. <Negrito>Cancelamento:</Negrito> Reservas podem ser canceladas pelo usuário
                    com antecedência mínima de <Negrito>48 (quarenta e oito) horas</Negrito> antes do
                    horário reservado. Cancelamentos fora desse prazo poderão não ser aceitos.
                </Paragrafo>
                <Paragrafo>
                    7.3. <Negrito>Não comparecimento (No-show):</Negrito> O não comparecimento ao
                    espaço reservado, sem cancelamento prévio dentro do prazo estabelecido, poderá
                    acarretar penalidades a serem definidas pela SECTI, incluindo a possível
                    restrição temporária à realização de novas reservas. O usuário será
                    comunicado sobre quaisquer penalidades aplicadas.
                </Paragrafo>
                <Paragrafo>
                    7.4. A SECTI reserva-se o direito de cancelar ou reagendar reservas em razão
                    de necessidades operacionais, notificando o usuário com a maior antecedência
                    possível.
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="8. Conduta do Usuário">
                <Paragrafo>
                    Ao utilizar o aplicativo e os espaços reservados, o usuário compromete-se a:
                </Paragrafo>
                <Paragrafo>
                    a) Respeitar as normas internas de uso dos espaços da SECTI;{'\n'}
                    b) Não ceder ou transferir sua reserva a terceiros;{'\n'}
                    c) Zelar pela conservação dos espaços e dos equipamentos disponibilizados;{'\n'}
                    d) Não utilizar os espaços para fins ilícitos ou contrários à finalidade
                    pública da SECTI;{'\n'}
                    e) Não praticar atos de assédio, discriminação ou qualquer forma de violência
                    nos espaços reservados.
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="9. Suspensão e Encerramento de Conta">
                <Paragrafo>
                    A SECTI poderá suspender ou encerrar a conta do usuário que violar estes
                    Termos, sem prejuízo das medidas administrativas e legais cabíveis. O
                    encerramento voluntário da conta pode ser solicitado pelo usuário por e-mail,
                    conforme descrito na Política de Privacidade.
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="10. Disponibilidade do Serviço">
                <Paragrafo>
                    A SECTI não garante a disponibilidade ininterrupta do aplicativo e poderá,
                    a qualquer tempo, realizar manutenções, atualizações ou suspender
                    temporariamente o serviço, buscando minimizar o impacto aos usuários.
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="11. Propriedade Intelectual">
                <Paragrafo>
                    Todo o conteúdo do aplicativo – incluindo marca, logotipos, textos, imagens
                    e código-fonte – é de titularidade da SECTI ou de seus licenciantes e está
                    protegido pela legislação brasileira de propriedade intelectual. É vedada
                    qualquer reprodução ou uso não autorizado.
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="12. Alterações nos Termos">
                <Paragrafo>
                    Estes Termos podem ser atualizados periodicamente. Sempre que houver alteração
                    relevante, o usuário será notificado por <Negrito>e-mail</Negrito> cadastrado na
                    plataforma. O uso continuado do aplicativo após a notificação implica
                    aceitação das novas condições.
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="13. Lei Aplicável e Foro">
                <Paragrafo>
                    Estes Termos são regidos pelas leis da República Federativa do Brasil.
                    Fica eleito o foro da comarca de <Negrito>São Luís – MA</Negrito> para dirimir
                    quaisquer controvérsias decorrentes deste instrumento, ressalvadas as
                    hipóteses de competência absoluta previstas em lei.
                </Paragrafo>
            </SecaoDoDocumento>
        </DocumentoLegal>
    );
}
