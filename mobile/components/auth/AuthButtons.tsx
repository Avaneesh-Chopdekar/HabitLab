import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import onboardingStyles, { COLORS } from "../onboarding/styles";
import GoogleIcon from "../../assets/images/google.svg";

type AuthButtonsProps = {
  // Primary action (Sign In / Create Account / Verify)
  primaryLabel?: string;
  onPrimaryPress: (e: GestureResponderEvent) => void;
  primaryLoading?: boolean;
  primaryDisabled?: boolean;

  // Secondary action (Google / Apple / etc.)
  secondaryLabel?: string;
  onSecondaryPress?: (e: GestureResponderEvent) => void;
  secondaryDisabled?: boolean;
  secondaryIconName?: React.ComponentProps<typeof MaterialIcons>["name"];

  // Visual
  showDivider?: boolean;
  containerStyle?: any;
};

/**
 * Reusable AuthButtons component
 *
 * Renders a primary (filled) button and a secondary (outline / alternative) button.
 * Optionally shows a divider between them.
 */
export default function AuthButtons({
  primaryLabel = "Continue",
  onPrimaryPress,
  primaryLoading = false,
  primaryDisabled = false,
  secondaryLabel = "Continue with Google",
  onSecondaryPress,
  secondaryDisabled = false,
  secondaryIconName = "login",
  showDivider = true,
  containerStyle,
}: AuthButtonsProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable
        style={({ pressed }) => [
          onboardingStyles.primaryButton,
          pressed && onboardingStyles.primaryButtonPressed,
          (primaryDisabled || primaryLoading) &&
            onboardingStyles.primaryButtonDisabled,
          styles.primaryWrapper,
        ]}
        onPress={onPrimaryPress}
        disabled={primaryDisabled || primaryLoading}
        accessibilityRole="button"
        accessibilityState={{ disabled: primaryDisabled || primaryLoading }}
      >
        {primaryLoading ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <Text style={onboardingStyles.primaryButtonText}>{primaryLabel}</Text>
        )}
      </Pressable>

      {showDivider && (
        <View style={onboardingStyles.dividerContainer}>
          <View style={onboardingStyles.divider} />
          <Text style={onboardingStyles.dividerText}>or</Text>
          <View style={onboardingStyles.divider} />
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          onboardingStyles.secondaryButton,
          pressed && onboardingStyles.secondaryButtonPressed,
          secondaryDisabled && { opacity: 0.6 },
          styles.secondaryWrapper,
        ]}
        onPress={onSecondaryPress}
        disabled={secondaryDisabled || !onSecondaryPress}
        accessibilityRole="button"
        accessibilityState={{
          disabled: secondaryDisabled || !onSecondaryPress,
        }}
      >
        {/* Icon */}
        {secondaryIconName ? <GoogleIcon width={20} height={20} /> : null}

        <Text style={onboardingStyles.secondaryButtonText}>
          {secondaryLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  primaryWrapper: {
    // ensure full width and consistent spacing with other elements
    alignSelf: "stretch",
  },
  secondaryWrapper: {
    marginTop: 12,
    alignSelf: "stretch",
  },
});
