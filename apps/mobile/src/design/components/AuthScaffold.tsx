/**
 * AuthScaffold — moldura comum das telas de autenticação.
 *
 * Dá a TODAS as telas do fluxo (recuperar senha, validar código, nova senha) a
 * mesma estrutura: scroll com teclado, um selo de ícone como âncora visual,
 * título + subtítulo centralizados e um card branco com o conteúdo. Isso é o que
 * faz o fluxo inteiro parecer "uma coisa só", não telas avulsas.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text, Surface, Icon } from 'react-native-paper';
import { colors, spacing, radius, typography } from '../tokens';

type AuthScaffoldProps = {
  /** Ícone do selo no topo (MaterialCommunityIcons), ex: "lock-reset" */
  icon: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Centraliza verticalmente o card (telas curtas) */
  centerVertically?: boolean;
};

export function AuthScaffold({ icon, title, subtitle, children, centerVertically }: AuthScaffoldProps) {
  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, centerVertically && styles.contentCentered]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={20}
    >
      <View style={styles.header}>
        <Surface style={styles.iconBadge} elevation={0}>
          <Icon source={icon} size={32} color={colors.text.onBrand} />
        </Surface>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <Surface style={styles.card} elevation={0}>
        {children}
      </Surface>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  contentCentered: {
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  title: {
    fontFamily: typography.family,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    fontSize: typography.size.xxl,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.family,
    color: colors.text.secondary,
    fontSize: typography.size.base,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
});
