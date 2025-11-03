/**
 * Professional color palette and theme for PennyPilot
 * Optimized for glass-morphism UI and dark mode
 */

import { Platform } from 'react-native';

// Primary brand colors - Premium dark theme
const primaryBlue = '#3B82F6';
const primaryPurple = '#8B5CF6';
const accentGreen = '#10B981';
const accentRed = '#EF4444';
const accentYellow = '#F59E0B';

export const Colors = {
  light: {
    text: '#1F2937',
    textSecondary: '#6B7280',
    background: '#F8FAFC',
    backgroundSecondary: '#F1F5F9',
    tint: primaryBlue,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: primaryBlue,

    // Glass-morphism colors
    glassBackground: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.95)',
    glassAccent: 'rgba(59, 130, 246, 0.15)',

    // Semantic colors
    success: accentGreen,
    error: accentRed,
    warning: accentYellow,
    info: primaryBlue,

    // Card colors
    cardBg: 'rgba(255, 255, 255, 0.9)',
    cardBorder: 'rgba(226, 232, 240, 0.8)',
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    background: '#0F172A', // Deep slate
    backgroundSecondary: '#1E293B',
    tint: primaryBlue,
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: primaryBlue,

    // Glass-morphism colors - Enhanced for dark mode
    glassBackground: 'rgba(30, 41, 59, 0.7)',
    glassBorder: 'rgba(148, 163, 184, 0.15)',
    glassAccent: 'rgba(59, 130, 246, 0.2)',

    // Semantic colors
    success: accentGreen,
    error: accentRed,
    warning: accentYellow,
    info: primaryBlue,

    // Card colors
    cardBg: 'rgba(30, 41, 59, 0.8)',
    cardBorder: 'rgba(71, 85, 105, 0.3)',
  },
};

// Gradient presets for backgrounds
export const Gradients = {
  light: {
    primary: ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD'],
    purple: ['#FAF5FF', '#F3E8FF', '#E9D5FF', '#D8B4FE'],
    success: ['#ECFDF5', '#D1FAE5', '#A7F3D0', '#6EE7B7'],
    mixed: ['#EFF6FF', '#F5F3FF', '#FEF3C7', '#FED7AA'],
  },
  dark: {
    primary: ['#0F172A', '#1E293B', '#1E3A5F', '#1E293B'], // Deep blue gradient
    purple: ['#1E1B4B', '#312E81', '#3730A3', '#4338CA'],
    success: ['#022C22', '#064E3B', '#065F46', '#047857'],
    mixed: ['#0F172A', '#1E1B4B', '#18181B', '#27272A'], // Premium dark
  },
};

// Category colors
export const CategoryColors = {
  food: '#EF4444',
  transport: '#3B82F6',
  shopping: '#F59E0B',
  bills: '#8B5CF6',
  health: '#10B981',
  entertainment: '#EC4899',
  travel: '#06B6D4',
  education: '#6366F1',
  misc: '#6B7280',
};

// Font configuration
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Spacing system (8pt grid)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// Shadow presets
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
};
