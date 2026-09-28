import React from 'react';
import { usePublicStackNavigation } from '../../navigation/PublicNavigator';
import { DocumentoLegal, Negrito, Paragrafo, SecaoDoDocumento } from '../../components/acesso/DocumentoLegal';

export default function PoliticaDePrivacidadeScreen() {
    const navigation = usePublicStackNavigation();

    return (
        <DocumentoLegal titulo="Política de Privacidade" atualizadoEm="23 de abril de 2026" onVoltar={() => navigation.pop()}>
            <SecaoDoDocumento titulo="1. Controlador dos Dados">
                <Paragrafo>
                    A <Negrito>Secretaria de Estado da Ciência, Tecnologia e Inovação – SECTI</Negrito>,
                    CNPJ 05.572.043/0001-65, com sede na Av. dos Holandeses, 9 – Calhau,
                    São Luís – MA, CEP 65.071-380, é a controladora dos dados pessoais
                    tratados por meio do aplicativo <Negrito>Locomotiva Hub</Negrito>.
                </Paragrafo>
                <Paragrafo>
                    Os espaços físicos operados pela plataforma estão localizados na{' '}
                    <Negrito>Av. José Sarney, 137 – Centro, São Luís – MA, CEP 65010-520</Negrito>.
                </Paragrafo>
                <Paragrafo>
                    Contato para assuntos relacionados à privacidade:{'\n'}
                    ouvidoria@secti.ma.gov.br | locomotivahub@gmail.com
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="2. Dados Coletados">
                <Paragrafo>
                    Para o funcionamento do aplicativo, coletamos exclusivamente os seguintes
                    dados pessoais no momento do cadastro:
                </Paragrafo>
                <Paragrafo>
                    • <Negrito>Nome completo</Negrito> – identificação do usuário na plataforma;{'\n'}
                    • <Negrito>E-mail</Negrito> – comunicação e autenticação;{'\n'}
                    • <Negrito>Telefone</Negrito> – contato sobre reservas e pedidos de impressão;{'\n'}
                    • <Negrito>CPF</Negrito> – identificação inequívoca do usuário e autenticação de
                    operações sensíveis na plataforma;{'\n'}
                    • <Negrito>Data de nascimento</Negrito> – verificação de elegibilidade (idade mínima
                    de 16 anos) e identificação do usuário;{'\n'}
                    • <Negrito>Empresa/Instituição</Negrito> (opcional) – identificação do vínculo
                    institucional do usuário, fornecido voluntariamente;{'\n'}
                    • <Negrito>Cargo</Negrito> (opcional) – identificação da função ou cargo do usuário,
                    fornecido voluntariamente.
                </Paragrafo>
                <Paragrafo>
                    Os campos Empresa/Instituição e Cargo são opcionais e não são exigidos para
                    o uso da plataforma. Não coletamos dados biométricos,
                    localização, dados financeiros ou quaisquer outros dados além dos listados acima.
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="3. Finalidade e Base Legal do Tratamento">
                <Paragrafo>
                    Os dados são tratados com as seguintes finalidades e bases legais,
                    nos termos da Lei Geral de Proteção de Dados (Lei n.º 13.709/2018 – LGPD):
                </Paragrafo>
                <Paragrafo>
                    • <Negrito>Criação e gestão de conta</Negrito> – execução de contrato (art. 7.º,
                    V, LGPD);{'\n'}
                    • <Negrito>Identificação do usuário e autenticação via CPF</Negrito> – execução
                    de contrato e cumprimento de obrigação legal (art. 7.º, II e V, LGPD);{'\n'}
                    • <Negrito>Comunicação sobre reservas e atualizações dos Termos</Negrito> –
                    execução de contrato e legítimo interesse da SECTI (art. 7.º, V e IX, LGPD);{'\n'}
                    • <Negrito>Controle de acesso a espaços públicos</Negrito> – exercício regular de
                    direitos e execução de políticas públicas (art. 7.º, III e VI, LGPD).
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="4. Armazenamento dos Dados">
                <Paragrafo>
                    Os dados são armazenados em banco de dados <Negrito>PostgreSQL</Negrito> mantido
                    em servidor próprio da SECTI, localizado no Brasil, com acesso restrito e
                    protegido por medidas técnicas e administrativas de segurança.
                </Paragrafo>
                <Paragrafo>
                    A autenticação no aplicativo utiliza tokens <Negrito>JWT</Negrito> (JSON Web Token).
                    O aplicativo não utiliza cookies de rastreamento ou tecnologias similares.
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="5. Compartilhamento de Dados">
                <Paragrafo>
                    Os dados pessoais são tratados exclusivamente pela <Negrito>SECTI</Negrito> e
                    seus servidores autorizados. Não compartilhamos, vendemos, cedemos ou
                    transferimos dados a terceiros, parceiros comerciais ou outras entidades,
                    exceto quando exigido por determinação legal ou judicial.
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="6. Retenção dos Dados">
                <Paragrafo>
                    Os dados são mantidos enquanto a conta do usuário estiver ativa. Após a
                    exclusão da conta, os dados serão removidos em até <Negrito>7 (sete) dias úteis</Negrito>,
                    salvo obrigação legal de retenção.
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="7. Direitos do Titular">
                <Paragrafo>
                    Em conformidade com a LGPD, o usuário tem os seguintes direitos em relação
                    aos seus dados pessoais:
                </Paragrafo>
                <Paragrafo>
                    • <Negrito>Confirmação</Negrito> da existência de tratamento;{'\n'}
                    • <Negrito>Acesso</Negrito> aos dados;{'\n'}
                    • <Negrito>Correção</Negrito> de dados incompletos, inexatos ou desatualizados;{'\n'}
                    • <Negrito>Anonimização, bloqueio ou eliminação</Negrito> de dados desnecessários
                    ou tratados em desconformidade com a LGPD;{'\n'}
                    • <Negrito>Portabilidade</Negrito> dos dados a outro fornecedor de serviço;{'\n'}
                    • <Negrito>Eliminação</Negrito> dos dados tratados com base no consentimento;{'\n'}
                    • <Negrito>Revogação do consentimento</Negrito>, quando aplicável;{'\n'}
                    • <Negrito>Informação</Negrito> sobre entidades com as quais os dados foram
                    compartilhados.
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="8. Exclusão de Conta e Dados">
                <Paragrafo>
                    Não há funcionalidade de exclusão de conta diretamente pelo aplicativo.
                    Para solicitar a exclusão definitiva de todos os seus dados, o usuário
                    deve enviar um e-mail para <Negrito>locomotivahub@gmail.com</Negrito> com
                    o assunto <Negrito>"Exclusão de dados – Locomotiva Hub"</Negrito>, informando o
                    nome completo e o e-mail cadastrado.
                </Paragrafo>
                <Paragrafo>
                    A solicitação será atendida em até <Negrito>7 (sete) dias úteis</Negrito> a
                    contar do recebimento do pedido.
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="9. Segurança dos Dados">
                <Paragrafo>
                    A SECTI adota medidas técnicas e organizacionais adequadas para proteger
                    os dados pessoais contra acesso não autorizado, perda acidental, destruição
                    ou divulgação indevida. Em caso de incidente de segurança que possa acarretar
                    risco ao usuário, a SECTI notificará os titulares afetados e a Autoridade
                    Nacional de Proteção de Dados (ANPD) nos prazos legais.
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="10. Menores de Idade">
                <Paragrafo>
                    O aplicativo é destinado a usuários com <Negrito>16 anos ou mais</Negrito>.
                    Usuários entre 16 e 17 anos são considerados relativamente capazes, podendo
                    utilizar a plataforma de forma autônoma, nos termos do Código Civil e da LGPD.
                    Não coletamos intencionalmente dados de crianças (menores de 12 anos) ou
                    adolescentes com menos de 16 anos.
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="11. Alterações nesta Política">
                <Paragrafo>
                    Esta Política de Privacidade pode ser atualizada periodicamente. Sempre que
                    houver alteração relevante, o usuário cadastrado será notificado por{' '}
                    <Negrito>e-mail</Negrito>. O uso continuado do aplicativo após o recebimento da
                    notificação implica a aceitação das novas condições.
                </Paragrafo>
            </SecaoDoDocumento>

            <SecaoDoDocumento titulo="12. Autoridade Nacional de Proteção de Dados">
                <Paragrafo>
                    Caso o usuário entenda que seus direitos não foram atendidos, pode apresentar
                    reclamação à <Negrito>Autoridade Nacional de Proteção de Dados (ANPD)</Negrito>,
                    por meio do portal gov.br/anpd.
                </Paragrafo>
            </SecaoDoDocumento>
        </DocumentoLegal>
    );
}
