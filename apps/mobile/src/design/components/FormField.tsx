/**
 * FormField — campo de formulário padronizado do Locomotiva Hub.
 *
 * Junta num só componente o que antes era repetido em CADA tela: label + input
 * (com todas as cores/raio do tema) + mensagem de erro + texto de ajuda + toggle
 * de senha. Isso é o que garante que TODOS os inputs do app sejam idênticos —
 * a base de um visual coeso (redesign, não recolor).
 *
 * Uso:
 *   <FormField control={control} name="email" label="E-mail"
 *     placeholder="exemplo@email.com" leftIcon="email" keyboardType="email-address" />
 */
import React, { useState } from 'react';
import { StyleSheet, StyleProp, TextStyle, KeyboardTypeOptions } from 'react-native';
import { Text, TextInput, HelperText, useTheme } from 'react-native-paper';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { colors, spacing, radius, typography } from '../tokens';

type FormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  /** Texto leve ao lado do label, ex: "(opcional)" */
  labelHint?: string;
  placeholder?: string;
  /** Ícone à esquerda (nome do MaterialCommunityIcons) */
  leftIcon?: string;
  /** Ícone à direita (ignorado quando `secure` está ativo — o olho assume) */
  rightIcon?: string;
  /** Ativa campo de senha com botão de mostrar/ocultar */
  secure?: boolean;
  /** Texto de orientação exibido quando não há erro */
  helperText?: string;
  /** Transforma o texto enquanto digita (máscaras de CPF, telefone, etc.) */
  format?: (text: string) => string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  /** Estilo extra do texto digitado (ex: código centralizado e grande) */
  inputStyle?: StyleProp<TextStyle>;
};

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  labelHint,
  placeholder,
  leftIcon,
  rightIcon,
  secure = false,
  helperText,
  format,
  keyboardType,
  maxLength,
  autoCapitalize,
  inputStyle,
}: FormFieldProps<T>) {
  const theme = useTheme();
  const [hidden, setHidden] = useState(true);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <>
          {label ? (
            <Text style={styles.label}>
              {label}
              {labelHint ? <Text style={styles.labelHint}> {labelHint}</Text> : null}
            </Text>
          ) : null}
          <TextInput
            mode="outlined"
            placeholder={placeholder}
            value={value}
            onBlur={onBlur}
            onChangeText={(text) => onChange(format ? format(text) : text)}
            error={!!error}
            secureTextEntry={secure && hidden}
            keyboardType={keyboardType}
            maxLength={maxLength}
            autoCapitalize={autoCapitalize}
            left={leftIcon ? <TextInput.Icon icon={leftIcon} color={theme.colors.onSurfaceVariant} /> : undefined}
            right={
              secure ? (
                <TextInput.Icon
                  icon={hidden ? 'eye-off' : 'eye'}
                  color={theme.colors.onSurfaceVariant}
                  onPress={() => setHidden((h) => !h)}
                />
              ) : rightIcon ? (
                <TextInput.Icon icon={rightIcon} color={theme.colors.onSurfaceVariant} />
              ) : undefined
            }
            outlineColor={colors.border.subtle}
            activeOutlineColor={colors.brand.blue}
            textColor={colors.text.primary}
            placeholderTextColor={colors.text.muted}
            style={[styles.input, inputStyle] as any}
            outlineStyle={styles.outline}
          />
          {error ? (
            <HelperText type="error" visible style={styles.helper}>
              {error.message as string}
            </HelperText>
          ) : helperText ? (
            <HelperText type="info" visible style={[styles.helper, styles.infoHelper]}>
              {helperText}
            </HelperText>
          ) : null}
        </>
      )}
    />
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: typography.family,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    fontSize: typography.size.base,
    marginBottom: spacing.sm,
  },
  labelHint: {
    fontWeight: typography.weight.regular,
    color: colors.text.muted,
    fontSize: typography.size.sm,
  },
  input: {
    backgroundColor: colors.surface.card,
    fontSize: typography.size.md,
  },
  outline: {
    borderRadius: radius.md,
  },
  helper: {
    paddingHorizontal: 0,
    paddingTop: spacing.xs,
  },
  infoHelper: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
  },
});
