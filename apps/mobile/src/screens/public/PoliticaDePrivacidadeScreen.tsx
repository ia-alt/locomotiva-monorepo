import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, IconButton, Divider, useTheme } from 'react-native-paper';
import { usePublicStackNavigation } from '../../navigation/PublicNavigator';

export default function PoliticaDePrivacidadeScreen() {
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
                <Text variant="titleMedium" style={styles.appBarTitle}>Política de Privacidade</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                <Text variant="bodySmall" style={styles.updated}>
                    Última atualização: 23 de abril de 2026
                </Text>

                <Section title="1. Controlador dos Dados">
                    <Paragraph>
                        A <Bold>Secretaria de Estado da Ciência, Tecnologia e Inovação – SECTI</Bold>,
                        CNPJ 05.572.043/0001-65, com sede na Av. dos Holandeses, 9 – Calhau,
                        São Luís – MA, CEP 65.071-380, é a controladora dos dados pessoais
                        tratados por meio do aplicativo <Bold>Locomotiva Hub</Bold>.
                    </Paragraph>
                    <Paragraph>
                        Os espaços físicos operados pela plataforma estão localizados na{' '}
                        <Bold>Av. José Sarney, 137 – Centro, São Luís – MA, CEP 65010-520</Bold>.
                    </Paragraph>
                    <Paragraph>
                        Contato para assuntos relacionados à privacidade:{'\n'}
                        (98) 91234-5678 | locomotivahub@gmail.com
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="2. Dados Coletados">
                    <Paragraph>
                        Para o funcionamento do aplicativo, coletamos exclusivamente os seguintes
                        dados pessoais no momento do cadastro:
                    </Paragraph>
                    <Paragraph>
                        • <Bold>Nome completo</Bold> – identificação do usuário na plataforma;{'\n'}
                        • <Bold>E-mail</Bold> – comunicação e autenticação;{'\n'}
                        • <Bold>CPF</Bold> – identificação inequívoca do usuário e autenticação de
                        operações sensíveis na plataforma;{'\n'}
                        • <Bold>Data de nascimento</Bold> – verificação de elegibilidade (idade mínima
                        de 16 anos) e identificação do usuário.
                    </Paragraph>
                    <Paragraph>
                        Não coletamos dados biométricos, número de telefone, localização, dados
                        financeiros ou quaisquer outros dados além dos listados acima.
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="3. Finalidade e Base Legal do Tratamento">
                    <Paragraph>
                        Os dados são tratados com as seguintes finalidades e bases legais,
                        nos termos da Lei Geral de Proteção de Dados (Lei n.º 13.709/2018 – LGPD):
                    </Paragraph>
                    <Paragraph>
                        • <Bold>Criação e gestão de conta</Bold> – execução de contrato (art. 7.º,
                        V, LGPD);{'\n'}
                        • <Bold>Identificação do usuário e autenticação via CPF</Bold> – execução
                        de contrato e cumprimento de obrigação legal (art. 7.º, II e V, LGPD);{'\n'}
                        • <Bold>Comunicação sobre reservas e atualizações dos Termos</Bold> –
                        execução de contrato e legítimo interesse da SECTI (art. 7.º, V e IX, LGPD);{'\n'}
                        • <Bold>Controle de acesso a espaços públicos</Bold> – exercício regular de
                        direitos e execução de políticas públicas (art. 7.º, III e VI, LGPD).
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="4. Armazenamento dos Dados">
                    <Paragraph>
                        Os dados são armazenados em banco de dados <Bold>PostgreSQL</Bold> mantido
                        em servidor próprio da SECTI, localizado no Brasil, com acesso restrito e
                        protegido por medidas técnicas e administrativas de segurança.
                    </Paragraph>
                    <Paragraph>
                        A autenticação no aplicativo utiliza tokens <Bold>JWT</Bold> (JSON Web Token).
                        O aplicativo não utiliza cookies de rastreamento ou tecnologias similares.
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="5. Compartilhamento de Dados">
                    <Paragraph>
                        Os dados pessoais são tratados exclusivamente pela <Bold>SECTI</Bold> e
                        seus servidores autorizados. Não compartilhamos, vendemos, cedemos ou
                        transferimos dados a terceiros, parceiros comerciais ou outras entidades,
                        exceto quando exigido por determinação legal ou judicial.
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="6. Retenção dos Dados">
                    <Paragraph>
                        Os dados são mantidos enquanto a conta do usuário estiver ativa. Após a
                        exclusão da conta, os dados serão removidos em até <Bold>7 (sete) dias úteis</Bold>,
                        salvo obrigação legal de retenção.
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="7. Direitos do Titular">
                    <Paragraph>
                        Em conformidade com a LGPD, o usuário tem os seguintes direitos em relação
                        aos seus dados pessoais:
                    </Paragraph>
                    <Paragraph>
                        • <Bold>Confirmação</Bold> da existência de tratamento;{'\n'}
                        • <Bold>Acesso</Bold> aos dados;{'\n'}
                        • <Bold>Correção</Bold> de dados incompletos, inexatos ou desatualizados;{'\n'}
                        • <Bold>Anonimização, bloqueio ou eliminação</Bold> de dados desnecessários
                        ou tratados em desconformidade com a LGPD;{'\n'}
                        • <Bold>Portabilidade</Bold> dos dados a outro fornecedor de serviço;{'\n'}
                        • <Bold>Eliminação</Bold> dos dados tratados com base no consentimento;{'\n'}
                        • <Bold>Revogação do consentimento</Bold>, quando aplicável;{'\n'}
                        • <Bold>Informação</Bold> sobre entidades com as quais os dados foram
                        compartilhados.
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="8. Exclusão de Conta e Dados">
                    <Paragraph>
                        Não há funcionalidade de exclusão de conta diretamente pelo aplicativo.
                        Para solicitar a exclusão definitiva de todos os seus dados, o usuário
                        deve enviar um e-mail para <Bold>locomotivahub@gmail.com</Bold> com
                        o assunto <Bold>"Exclusão de dados – Locomotiva Hub"</Bold>, informando o
                        nome completo e o e-mail cadastrado.
                    </Paragraph>
                    <Paragraph>
                        A solicitação será atendida em até <Bold>7 (sete) dias úteis</Bold> a
                        contar do recebimento do pedido.
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="9. Segurança dos Dados">
                    <Paragraph>
                        A SECTI adota medidas técnicas e organizacionais adequadas para proteger
                        os dados pessoais contra acesso não autorizado, perda acidental, destruição
                        ou divulgação indevida. Em caso de incidente de segurança que possa acarretar
                        risco ao usuário, a SECTI notificará os titulares afetados e a Autoridade
                        Nacional de Proteção de Dados (ANPD) nos prazos legais.
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="10. Menores de Idade">
                    <Paragraph>
                        O aplicativo é destinado a usuários com <Bold>16 anos ou mais</Bold>.
                        Usuários entre 16 e 17 anos são considerados relativamente capazes, podendo
                        utilizar a plataforma de forma autônoma, nos termos do Código Civil e da LGPD.
                        Não coletamos intencionalmente dados de crianças (menores de 12 anos) ou
                        adolescentes com menos de 16 anos.
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="11. Alterações nesta Política">
                    <Paragraph>
                        Esta Política de Privacidade pode ser atualizada periodicamente. Sempre que
                        houver alteração relevante, o usuário cadastrado será notificado por{' '}
                        <Bold>e-mail</Bold>. O uso continuado do aplicativo após o recebimento da
                        notificação implica a aceitação das novas condições.
                    </Paragraph>
                </Section>

                <Divider style={styles.divider} />

                <Section title="12. Autoridade Nacional de Proteção de Dados">
                    <Paragraph>
                        Caso o usuário entenda que seus direitos não foram atendidos, pode apresentar
                        reclamação à <Bold>Autoridade Nacional de Proteção de Dados (ANPD)</Bold>,
                        por meio do portal gov.br/anpd.
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
