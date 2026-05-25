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
  primary: "#1E5FA1",
  primaryLight: "#E8F2FE",
  primaryDark: "#1A2B48",
  secondary: "#50B498",
  background: "#F8F7F2",
  surface: "#FFFFFF",
  text: "#1A2036",
  textSecondary: "#757E91",
  textLight: "#9CA3AF",
  border: "#E8E6E1",
  success: "#50B498",
  successLight: "#E6F4EA",
  successText: "#137333",
  danger: "#EF4444",
  error: "#EF4444",
  warning: "#F59E0B",
  accent: "#E86332",
  accentLight: "#FFF7ED",
  tealBg: "#E6FFFA",
  tealText: "#2C7A7B",
  navy: "#1A202C",
  matchGreen: "#50B498",
  matchGreenBg: "#E6F4EA",
  matchBlue: "#3B82F6",
  matchBlueBg: "#EFF6FF",
  headerBlue: "#1E5FA1",
  labourNavy: "#1A2036",
  resumeGreen: "#2D7D53",
  resumeGreenDark: "#1F5C3D",
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
  h1: 32,
  h2: 26,
  h3: 22,
  body: 16,
  small: 14,
  caption: 12,
  label: {
    fontSize: 14,
    fontWeight: "700",
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
  },
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
};

export const SHADOWS = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
};
