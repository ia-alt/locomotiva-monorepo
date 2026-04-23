import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, IconButton, Divider, useTheme } from 'react-native-paper';
import { usePublicStackNavigation } from '../../navigation/PublicNavigator';

export default function TermosDeServicoScreen() {
    const navigation = usePublicStackNavigation();
    const theme = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.appBar}>
                <IconButton
                    icon="chevron-left"
                    size={28}
                    iconColor={theme.colors.onSurface}
                    onPress={() => navigation.pop()}
                    style={styles.backButton}
                />
                <Text variant="titleMedium" style={styles.appBarTitle}>Termos de Serviço</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                <Text variant="bodySmall" style={styles.updated}>
                    Última atualização: 23 de abril de 2026
                </Text>

                <Section title="1. Identificação do Controlador">
                    <Paragraph>
                        O aplicativo <Bold>Locomotiva Hub</Bold> é operado pela{' '}
                        <Bold>Secretaria de Estado da Ciência, Tecnologia e Inovação – SECTI</Bold>,
                        pessoa jurídica de direito público, inscrita no CNPJ sob o n.º 05.572.043/0001-65,
                        com sede na Avenida dos Holandeses, 9 – Calhau, São Luís – MA, CEP 65.071-380.
                    </Paragraph>
                    <Paragraph>
                        Os espaços disponibilizados para reserva estão localizados na{' '}
                        <Bold>Av. José Sarney, 137 – Centro, São Luís – MA, CEP 65010-520</Bold>.
                    </Paragraph>
                    <Paragraph>
                        Contato: (98) 91234-5678 | locomotivahub@gmail.com
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="2. Objeto">
                    <Paragraph>
                        Estes Termos de Serviço ("Termos") regulam o acesso e o uso do aplicativo
                        Locomotiva Hub, plataforma digital gratuita destinada ao agendamento e gerenciamento
                        de reservas de espaços (salas, laboratórios e áreas de uso compartilhado)
                        administrados pela SECTI.
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="3. Aceitação dos Termos">
                    <Paragraph>
                        Ao criar uma conta ou utilizar o aplicativo, o usuário declara ter lido,
                        compreendido e concordado integralmente com estes Termos. Caso não concorde
                        com qualquer disposição, deve abster-se de utilizar o serviço.
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="4. Público-Alvo e Idade Mínima">
                    <Paragraph>
                        O Locomotiva Hub é aberto a qualquer pessoa física interessada em utilizar
                        os espaços administrados pela SECTI. O cadastro é permitido a partir de{' '}
                        <Bold>16 (dezesseis) anos de idade</Bold>. Usuários entre 16 e 17 anos são
                        considerados relativamente capazes, nos termos do Código Civil brasileiro.
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="5. Cadastro e Conta de Usuário">
                    <Paragraph>
                        5.1. Para utilizar os recursos do aplicativo, o usuário deve criar uma conta
                        fornecendo: nome completo, e-mail, CPF e data de nascimento.
                    </Paragraph>
                    <Paragraph>
                        5.2. O usuário é responsável pela veracidade, atualidade e exatidão das
                        informações fornecidas, bem como pela guarda de suas credenciais de acesso.
                    </Paragraph>
                    <Paragraph>
                        5.3. É vedado o compartilhamento de credenciais com terceiros. Qualquer acesso
                        realizado mediante as credenciais do usuário será considerado de sua
                        responsabilidade.
                    </Paragraph>
                    <Paragraph>
                        5.4. O uso do CPF tem por finalidade a identificação inequívoca do usuário
                        e a autenticação de determinadas operações na plataforma.
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="6. Gratuidade do Serviço">
                    <Paragraph>
                        O acesso ao Locomotiva Hub e a utilização de todas as suas funcionalidades
                        são inteiramente <Bold>gratuitos</Bold>. Não há planos pagos, assinaturas ou
                        cobranças de qualquer natureza.
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="7. Reservas de Espaços">
                    <Paragraph>
                        7.1. O usuário pode realizar reservas de espaços disponíveis por meio do
                        aplicativo, sujeitas à disponibilidade e às regras de uso de cada local.
                    </Paragraph>
                    <Paragraph>
                        7.2. <Bold>Cancelamento:</Bold> Reservas podem ser canceladas pelo usuário
                        com antecedência mínima de <Bold>48 (quarenta e oito) horas</Bold> antes do
                        horário reservado. Cancelamentos fora desse prazo poderão não ser aceitos.
                    </Paragraph>
                    <Paragraph>
                        7.3. <Bold>Não comparecimento (No-show):</Bold> O não comparecimento ao
                        espaço reservado, sem cancelamento prévio dentro do prazo estabelecido, poderá
                        acarretar penalidades a serem definidas pela SECTI, incluindo a possível
                        restrição temporária à realização de novas reservas. O usuário será
                        comunicado sobre quaisquer penalidades aplicadas.
                    </Paragraph>
                    <Paragraph>
                        7.4. A SECTI reserva-se o direito de cancelar ou reagendar reservas em razão
                        de necessidades operacionais, notificando o usuário com a maior antecedência
                        possível.
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="8. Conduta do Usuário">
                    <Paragraph>
                        Ao utilizar o aplicativo e os espaços reservados, o usuário compromete-se a:
                    </Paragraph>
                    <Paragraph>
                        a) Respeitar as normas internas de uso dos espaços da SECTI;{'\n'}
                        b) Não ceder ou transferir sua reserva a terceiros;{'\n'}
                        c) Zelar pela conservação dos espaços e dos equipamentos disponibilizados;{'\n'}
                        d) Não utilizar os espaços para fins ilícitos ou contrários à finalidade
                        pública da SECTI;{'\n'}
                        e) Não praticar atos de assédio, discriminação ou qualquer forma de violência
                        nos espaços reservados.
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="9. Suspensão e Encerramento de Conta">
                    <Paragraph>
                        A SECTI poderá suspender ou encerrar a conta do usuário que violar estes
                        Termos, sem prejuízo das medidas administrativas e legais cabíveis. O
                        encerramento voluntário da conta pode ser solicitado pelo usuário por e-mail,
                        conforme descrito na Política de Privacidade.
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="10. Disponibilidade do Serviço">
                    <Paragraph>
                        A SECTI não garante a disponibilidade ininterrupta do aplicativo e poderá,
                        a qualquer tempo, realizar manutenções, atualizações ou suspender
                        temporariamente o serviço, buscando minimizar o impacto aos usuários.
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="11. Propriedade Intelectual">
                    <Paragraph>
                        Todo o conteúdo do aplicativo – incluindo marca, logotipos, textos, imagens
                        e código-fonte – é de titularidade da SECTI ou de seus licenciantes e está
                        protegido pela legislação brasileira de propriedade intelectual. É vedada
                        qualquer reprodução ou uso não autorizado.
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="12. Alterações nos Termos">
                    <Paragraph>
                        Estes Termos podem ser atualizados periodicamente. Sempre que houver alteração
                        relevante, o usuário será notificado por <Bold>e-mail</Bold> cadastrado na
                        plataforma. O uso continuado do aplicativo após a notificação implica
                        aceitação das novas condições.
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="13. Lei Aplicável e Foro">
                    <Paragraph>
                        Estes Termos são regidos pelas leis da República Federativa do Brasil.
                        Fica eleito o foro da comarca de <Bold>São Luís – MA</Bold> para dirimir
                        quaisquer controvérsias decorrentes deste instrumento, ressalvadas as
                        hipóteses de competência absoluta previstas em lei.
                    </Paragraph>
                </Section>

                <View style={styles.footer}>
                    <Text variant="bodySmall" style={styles.footerText}>
                        SECTI – Secretaria de Estado da Ciência, Tecnologia e Inovação{'\n'}
                        CNPJ: 05.572.043/0001-65{'\n'}
                        Av. dos Holandeses, 9 – Calhau, São Luís – MA, CEP 65.071-380
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={{ marginBottom: 8 }}>
            <Text variant="titleSmall" style={sectionTitleStyle}>{title}</Text>
            {children}
        </View>
    );
}

function Paragraph({ children }: { children: React.ReactNode }) {
    return (
        <Text variant="bodyMedium" style={paragraphStyle}>{children}</Text>
    );
}

function Bold({ children }: { children: React.ReactNode }) {
    return <Text style={{ fontWeight: 'bold' }}>{children}</Text>;
}

const sectionTitleStyle = {
    fontWeight: '700' as const,
    color: '#1e293b',
    marginBottom: 8,
    marginTop: 4,
};

const paragraphStyle = {
    color: '#475569',
    lineHeight: 22,
    marginBottom: 8,
};

const makeStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 48,
        paddingHorizontal: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outlineVariant,
    },
    backButton: {
        margin: 0,
        marginLeft: -4,
    },
    appBarTitle: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
    },
    placeholder: {
        width: 48,
    },
    content: {
        padding: 24,
        paddingBottom: 48,
    },
    updated: {
        color: '#94a3b8',
        marginBottom: 20,
        fontStyle: 'italic',
    },
    divider: {
        marginVertical: 12,
    },
    footer: {
        marginTop: 24,
        padding: 16,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
    },
    footerText: {
        color: '#64748b',
        lineHeight: 20,
        textAlign: 'center',
    },
});
