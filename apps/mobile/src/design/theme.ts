/**
 * Tema do React Native Paper construído A PARTIR dos design tokens.
 * Importe `theme` no App.tsx e passe ao <PaperProvider>. Assim, todo componente
 * do Paper (Button, TextInput, Surface...) já herda a identidade visual sem você
 * repetir cores em cada tela.
 */
import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { colors, typography } from './tokens';

// Aplica a fonte HankenGrotesk em todas as variantes de texto do Paper.
const fontConfig = configureFonts({
  config: { fontFamily: typography.family },
});

export const theme = {
  ...MD3LightTheme,
  fonts: fontConfig,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.brand.navy,
    onPrimary: colors.text.onBrand,
    primaryContainer: colors.brand.light,
    onPrimaryContainer: colors.brand.navy,
    secondary: colors.brand.blue,
    background: colors.surface.background,
    surface: colors.surface.card,
    surfaceVariant: colors.surface.subtle,
    onSurface: colors.text.primary,
    onSurfaceVariant: colors.text.secondary,
    outline: colors.border.strong,
    outlineVariant: colors.border.subtle,
    error: colors.feedback.error,
  },
};

export type AppTheme = typeof theme;
