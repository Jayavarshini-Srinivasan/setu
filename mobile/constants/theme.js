// setu-tokens.js — Setu Design System v1.0
export const setuTokens = {
  // Brand
  primary:       '#E85D26',
  primaryDark:   '#C44A18',
  primaryLight:  '#FDF0EB',

  // Dark
  secondary:     '#1A1A2E',

  // Semantic
  success:       '#1D9E75',
  danger:        '#E24B4A',
  info:          '#185FA5',
  accent:        '#F5A623',

  // Neutrals
  bg:            '#F7F5F2',
  bgCard:        '#FFFFFF',
  text:          '#1A1A2E',
  textMuted:     '#6B6B80',
  border:        'rgba(26,26,46,0.12)',

  // Surface tints
  infoBg:        '#E6F1FB',
  successBg:     '#E1F5EE',
  warningBg:     '#FDF0EB',
  dangerBg:      '#FCEBEB',

  // Fonts
  fontDisplay:   "'Playfair Display', Georgia, serif",
  fontBody:      "'DM Sans', system-ui, sans-serif",
  fontMono:      "'DM Mono', monospace",

  // Radius
  radiusCard:    18,
  radiusInput:   12,
  radiusButton:  12,
  radiusSmall:   10,
  radiusPill:    99,
  radiusIcon:    14,
};

// Worker context accent lookup
export const workerAccent = {
  labour:       '#E85D26',
  professional: '#185FA5',
};

// Maintain legacy names mapped to new Setu tokens for minimal breakage, but switch values to Setu colors
export const COLORS = {
  primary: setuTokens.primary,
  primaryLight: setuTokens.primaryLight,
  secondary: setuTokens.secondary,
  background: setuTokens.bg,
  surface: setuTokens.bgCard,
  text: setuTokens.text,
  textSecondary: setuTokens.textMuted,
  textLight: setuTokens.textMuted,
  border: setuTokens.border,
  success: setuTokens.success,
  danger: setuTokens.danger,
  error: setuTokens.danger,
  warning: setuTokens.accent,
  accent: setuTokens.primary,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const TYPOGRAPHY = {
  h1: 36,
  h2: 26,
  h3: 20,
  body: 14,
  small: 12,
  caption: 11,
};

export const BORDER_RADIUS = {
  sm: setuTokens.radiusSmall,
  md: setuTokens.radiusInput,
  lg: setuTokens.radiusCard,
  xl: setuTokens.radiusCard,
  pill: setuTokens.radiusPill,
};

export const SHADOWS = {
  card: {
    elevation: 0,
    shadowOpacity: 0,
  },
  lg: {
    elevation: 0,
    shadowOpacity: 0,
  },
};