import { StyleSheet } from "react-native";

/**
 * Shared styles, colors and tokens for onboarding components.
 *
 * Keep this file focused on visual tokens and commonly-used style rules so
 * multiple onboarding screens can import them and remain consistent.
 */

/* Color palette used across onboarding components */
export const COLORS = {
  primary: "#6366f1",
  primaryDark: "#4f46e5",
  primaryLight: "#818cf8",

  background: "#f0f0f0",
  surface: "#fff",
  surfaceLight: "#f1f5f9",

  text: "#1e293b",
  textSecondary: "#64748b",
  textTertiary: "#94a3b8",

  border: "#e2e8f0",
  borderLight: "#f1f5f9",

  error: "#ef4444",
  errorLight: "#fee2e2",

  success: "#10b981",
  successLight: "#d1fae5",

  transparent: "transparent",
  white: "#ffffff",
  black: "#000000",
  overlay: "rgba(0, 0, 0, 0.5)",
} as const;

/* Spacing scale */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/* Border radius tokens */
export const BORDER_RADIUS = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

/* Simple typography tokens */
export const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: "700" as const, lineHeight: 40 },
  h2: { fontSize: 28, fontWeight: "700" as const, lineHeight: 36 },
  h3: { fontSize: 24, fontWeight: "700" as const, lineHeight: 32 },
  body: { fontSize: 16, fontWeight: "500" as const, lineHeight: 24 },
  subtitle: { fontSize: 14, fontWeight: "500" as const, lineHeight: 21 },
  caption: { fontSize: 12, fontWeight: "500" as const, lineHeight: 18 },
} as const;

/* Reusable onboarding styles */
export const onboardingStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.xxxl,
  },

  // Toggle (Sign In / Sign Up)
  toggleContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: SPACING.sm * 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: COLORS.white,
  },

  // Header
  headerSection: {
    paddingBottom: 32,
  },
  title: {
    fontSize: TYPOGRAPHY.h2.fontSize,
    fontWeight: TYPOGRAPHY.h2.fontWeight,
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.subtitle.fontSize,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.subtitle.lineHeight,
  },

  // Error
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.errorLight,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm * 2,
    paddingHorizontal: SPACING.lg,
    marginBottom: 24,
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: 13,
    fontWeight: "500",
  },

  // Form
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 48,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  fieldErrorText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
  },

  // Primary button
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonPressed: {
    backgroundColor: COLORS.primaryDark,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },

  // Divider between methods
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
  },

  // Secondary button (Google etc.)
  secondaryButton: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 8,
  },
  secondaryButtonPressed: {
    backgroundColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },

  // Resend and back actions
  resendContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  resendText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  resendLink: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    paddingVertical: 12,
    gap: 8,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default onboardingStyles;
