/**
 * DCreators Design System — Figma Theme Tokens
 * ==============================================
 * Centralized design tokens extracted from the Figma design file.
 * All screens should import from this file to maintain visual consistency.
 *
 * Key design principles from Figma:
 * - Light blue-gray background (#EDF1F5 / #E8ECF0)
 * - Deep indigo primary (#4338CA)
 * - Teal accent (#3D9B8F / #2D8B7F)
 * - White/off-white input fields with soft rounded corners
 * - Indigo-filled CTA buttons with generous padding
 * - Clean, minimal header with hamburger + D icon
 */

import { Platform } from 'react-native';

// ─── Color Palette ───────────────────────────────────────────
export const colors = {
  // Primary brand colors (from Figma A/B series)
  primary: '#4338CA',        // Deep indigo — buttons, icons, accents
  primaryDark: '#3730A3',    // Hover/pressed state
  primaryLight: '#6366F1',   // Lighter variant

  // Secondary / Accent
  teal: '#3D9B8F',           // Teal — consultant cards, secondary CTAs
  tealDark: '#2D8B7F',       // Darker teal for borders
  orange: '#E8854A',         // Orange accent — client icon, highlights

  // Backgrounds
  screenBg: '#EDF1F5',       // Figma screen background (light blue-gray)
  cardBg: '#FFFFFF',         // Card backgrounds
  inputBg: '#F5F5F5',        // Input field backgrounds (off-white)
  sectionBg: '#F8F9FB',      // Section/panel backgrounds

  // Text hierarchy
  textPrimary: '#1F2937',    // Headings, primary text
  textSecondary: '#6B7280',  // Descriptions, subtitles
  textTertiary: '#9CA3AF',   // Placeholders, meta text
  textOnPrimary: '#FFFFFF',  // Text on primary buttons
  textLink: '#4338CA',       // Links (matches primary)

  // Borders & Dividers
  border: '#E5E7EB',         // Default border
  borderLight: '#F3F4F6',    // Subtle separator
  borderInput: '#D1D5DB',    // Input field borders
  borderCard: 'rgba(0,0,0,0.06)', // Card borders

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Overlays
  overlay: 'rgba(0,0,0,0.45)',
  overlayLight: 'rgba(0,0,0,0.06)',

  // Dashboard section backgrounds (matching Figma B1.x)
  sectionDark: '#4D4D4D',
  sectionBlack: '#1A1A1A',
  sectionBrown: '#4E3F30',

  // Figma button variants
  btnPrimary: '#4338CA',
  btnPrimaryText: '#FFFFFF',
  btnOutline: 'transparent',
  btnOutlineText: '#4338CA',
  btnOutlineBorder: '#4338CA',
  btnDisabled: '#9CA3AF',
  btnDanger: '#EF4444',
  btnSuccess: '#10B981',

  // Back button bar at bottom (Figma screens show a dark bar)
  bottomBar: '#2D2D2D',
} as const;


// ─── Typography ──────────────────────────────────────────────
export const fonts = {
  heavy: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif',
  medium: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  body: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif-light',
  light: Platform.OS === 'ios' ? 'Avenir-Light' : 'sans-serif-thin',
} as const;

export const fontSizes = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 30,
  '5xl': 36,
} as const;

export const lineHeights = {
  tight: 18,
  base: 22,
  relaxed: 28,
  loose: 34,
} as const;


// ─── Spacing ─────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 60,
} as const;


// ─── Border Radius ───────────────────────────────────────────
export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 16,
  '2xl': 20,
  full: 999,
} as const;


// ─── Shadows ─────────────────────────────────────────────────
export const shadows = {
  sm: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
    android: { elevation: 1 },
  }),
  md: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
    android: { elevation: 3 },
  }),
  lg: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12 },
    android: { elevation: 6 },
  }),
  card: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
    android: { elevation: 2 },
  }),
} as const;


// ─── Common Style Presets ────────────────────────────────────

/** Standard input field style matching Figma's rounded off-white inputs */
export const inputStyle = {
  backgroundColor: colors.inputBg,
  borderRadius: radii.xl,
  paddingHorizontal: spacing.xl,
  paddingVertical: spacing.lg,
  fontSize: fontSizes.lg,
  fontFamily: fonts.body,
  color: colors.textPrimary,
} as const;

/** Primary filled button (deep indigo) */
export const btnPrimaryStyle = {
  backgroundColor: colors.btnPrimary,
  paddingVertical: spacing.lg,
  paddingHorizontal: spacing['3xl'],
  borderRadius: radii.full,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
} as const;

/** Outline button */
export const btnOutlineStyle = {
  backgroundColor: colors.btnOutline,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing['2xl'],
  borderRadius: radii.full,
  borderWidth: 1.5,
  borderColor: colors.btnOutlineBorder,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
} as const;

/** Screen background wrapper (preserves bg-texture.png) */
export const screenBackground = {
  flex: 1,
  backgroundColor: colors.screenBg,
} as const;
