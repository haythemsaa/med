import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import colors from './colors';

/**
 * MediCare Medical Theme
 * Design moderne et professionnel adapté au secteur médical
 */
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary[500],
    primaryContainer: colors.primary[100],
    secondary: colors.secondary[500],
    secondaryContainer: colors.secondary[100],
    tertiary: colors.accent[500],
    tertiaryContainer: colors.accent[100],
    surface: colors.background.primary,
    surfaceVariant: colors.background.secondary,
    background: colors.background.secondary,
    error: colors.error,
    errorContainer: '#FFEBEE',
    onPrimary: colors.text.white,
    onPrimaryContainer: colors.primary[900],
    onSecondary: colors.text.white,
    onSecondaryContainer: colors.secondary[900],
    onTertiary: colors.text.white,
    onTertiaryContainer: colors.accent[900],
    onSurface: colors.text.primary,
    onSurfaceVariant: colors.text.secondary,
    onError: colors.text.white,
    onErrorContainer: '#B71C1C',
    onBackground: colors.text.primary,
    outline: colors.border.light,
    outlineVariant: colors.border.medium,
    inverseSurface: colors.gray[800],
    inverseOnSurface: colors.text.white,
    inversePrimary: colors.primary[200],
    shadow: colors.gray[900],
    scrim: colors.overlay.dark,
    backdrop: colors.overlay.medium,

    // Custom medical colors
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    emergency: colors.medical.emergency,
    consultation: colors.medical.consultation,
    prescription: colors.medical.prescription,
    lab: colors.medical.lab,
    vaccine: colors.medical.vaccine,
  },
  roundness: 12, // Coins arrondis modernes
};

export const typography = {
  displayLarge: {
    fontSize: 57,
    lineHeight: 64,
    fontWeight: '400' as const,
  },
  displayMedium: {
    fontSize: 45,
    lineHeight: 52,
    fontWeight: '400' as const,
  },
  displaySmall: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '400' as const,
  },
  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600' as const,
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600' as const,
  },
  headlineSmall: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
  },
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 3.84,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6.27,
    elevation: 6,
  },
};

export default theme;
