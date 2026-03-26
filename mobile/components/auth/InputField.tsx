import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  TextInputProps,
  ViewStyle,
  StyleProp,
} from "react-native";
import { Controller, Control } from "react-hook-form";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import onboardingStyles, { COLORS } from "../onboarding/styles";

type InputFieldProps = {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  returnKeyType?: TextInputProps["returnKeyType"];
  editable?: boolean;
  iconName?: keyof typeof MaterialIcons["glyphMap"] | string;
  rightIconName?: keyof typeof MaterialIcons["glyphMap"] | string;
  rules?: object;
  containerStyle?: StyleProp<ViewStyle>;
  inputProps?: Partial<TextInputProps>;
};

/**
 * Reusable InputField for auth screens.
 *
 * - Integrates with react-hook-form via `control` + `name`
 * - Shows label, left icon (optional), and right-side icons (visibility toggle etc.)
 * - Renders field-level validation errors coming from react-hook-form / zod
 */
export default function InputField({
  control,
  name,
  label,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
  autoCapitalize = "none",
  returnKeyType,
  editable = true,
  iconName,
  rightIconName,
  rules,
  containerStyle,
  inputProps,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const effectiveSecure = secureTextEntry && !showPassword;

  return (
    <View style={[onboardingStyles.formGroup, containerStyle]}>
      {label ? <Text style={onboardingStyles.label}>{label}</Text> : null}

      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <>
            <View
              style={[
                onboardingStyles.inputWrapper,
                error && onboardingStyles.inputWrapperError,
              ]}
            >
              {iconName ? (
                <MaterialIcons
                  name={String(iconName)}
                  size={20}
                  color={COLORS.textSecondary}
                  style={onboardingStyles.inputIcon}
                />
              ) : null}

              <TextInput
                style={onboardingStyles.input}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textSecondary}
                value={value as string}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType={keyboardType}
                secureTextEntry={effectiveSecure}
                autoCapitalize={autoCapitalize}
                returnKeyType={returnKeyType}
                editable={editable}
                {...inputProps}
              />

              {/* Right icon (visibility toggle or custom right icon) */}
              {secureTextEntry ? (
                <Pressable
                  onPress={() => setShowPassword((s) => !s)}
                  style={{ padding: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color={value ? COLORS.textSecondary : COLORS.border}
                  />
                </Pressable>
              ) : rightIconName ? (
                <MaterialIcons
                  name={String(rightIconName)}
                  size={20}
                  color={COLORS.textSecondary}
                  style={{ marginLeft: 8 }}
                />
              ) : null}
            </View>

            {error?.message ? (
              <Text style={onboardingStyles.fieldErrorText}>
                {String(error.message)}
              </Text>
            ) : null}
          </>
        )}
      />
    </View>
  );
}
