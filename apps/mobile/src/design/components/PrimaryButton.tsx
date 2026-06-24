/**
 * PrimaryButton — botão de ação principal padronizado (azul-marinho institucional).
 * Centraliza altura, raio e tipografia para que todo CTA do app seja idêntico.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { colors, radius, spacing, typography } from '../tokens';

type PrimaryButtonProps = {
  onPress: () => void;
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  /** Ícone opcional à direita do texto (ex: "arrow-right") */
  icon?: string;
};

export function PrimaryButton({ onPress, children, loading, disabled, icon }: PrimaryButtonProps) {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      icon={icon}
      buttonColor={colors.brand.navy}
      textColor={colors.text.onBrand}
      style={styles.button}
      contentStyle={[styles.content, icon ? styles.contentWithIcon : null]}
      labelStyle={styles.label}
    >
      {children}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  content: {
    paddingVertical: spacing.sm,
  },
  contentWithIcon: {
    flexDirection: 'row-reverse',
  },
  label: {
    fontFamily: typography.family,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
  },
});
