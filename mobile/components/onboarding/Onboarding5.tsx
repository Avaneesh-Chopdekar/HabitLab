import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import onboardingStyles, { COLORS } from "@/components/onboarding/styles";
import InputField from "@/components/auth/InputField";
import AuthButtons from "@/components/auth/AuthButtons";

import {
  loginSchema,
  registerSchema,
  verifyOtpSchema,
  type LoginRequest,
  type RegisterRequest,
  type VerifyOtpRequest,
} from "@/types/auth";

import { login, register, verifyOtp, resendOtp } from "@/api/auth";

interface Onboarding5Props {
  pagerRef: React.RefObject<any>;
}

// TODO: Add real colored google icon in continue with google button

export default function Onboarding5({ pagerRef }: Onboarding5Props) {
  const [mode, setMode] = useState<"login" | "signup" | "otp">("login");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [emailForOtp, setEmailForOtp] = useState("");

  // Forms
  const loginForm = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", username: "", password: "" },
  });

  const otpForm = useForm<VerifyOtpRequest>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email: "", otp: "" },
  });

  // Handlers
  const handleLogin: SubmitHandler<LoginRequest> = async (data) => {
    setServerMessage(null);
    setLoading(true);
    try {
      console.log("API URL:", process.env.EXPO_PUBLIC_API_URL);
      await login(data);
      pagerRef.current?.setPage(5);
    } catch (err: any) {
      setServerMessage(err?.message ?? "Login failed. Please try again.");
      console.log(err.message); // "Network Error"
      console.log(err.response); // ❌ undefined
    } finally {
      setLoading(false);
    }
  };

  const handleSignup: SubmitHandler<RegisterRequest> = async (data) => {
    setServerMessage(null);
    setLoading(true);
    try {
      await register(data);
      setEmailForOtp(data.email);
      otpForm.setValue("email", data.email);
      setMode("otp");
      setServerMessage("Verification code sent to your email.");
    } catch (err: any) {
      setServerMessage(err?.message ?? "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp: SubmitHandler<VerifyOtpRequest> = async (data) => {
    setServerMessage(null);
    setOtpLoading(true);
    try {
      await verifyOtp(data);
      pagerRef.current?.setPage(5);
    } catch (err: any) {
      setServerMessage(
        err?.message ?? "Verification failed. Please try again.",
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    if (!emailForOtp) {
      setServerMessage("No email available to resend OTP.");
      return;
    }
    setServerMessage(null);
    setOtpLoading(true);
    try {
      await resendOtp({ email: emailForOtp });
      setServerMessage("OTP resent. Check your email.");
    } catch (err: any) {
      setServerMessage(err?.message ?? "Failed to resend OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoogle = async () => {
    // Placeholder: integrate Google OAuth (expo-auth-session or native)
    setServerMessage("Google sign-in not implemented yet.");
  };

  // UI pieces
  const renderHeader = () => {
    if (mode === "login") {
      return (
        <>
          <Text style={onboardingStyles.title}>Welcome Back</Text>
          <Text style={onboardingStyles.subtitle}>Sign in to your account</Text>
        </>
      );
    }
    if (mode === "signup") {
      return (
        <>
          <Text style={onboardingStyles.title}>Create Account</Text>
          <Text style={onboardingStyles.subtitle}>Join HabitLab today</Text>
        </>
      );
    }
    return (
      <>
        <Text style={onboardingStyles.title}>Verify Email</Text>
        <Text style={onboardingStyles.subtitle}>
          Enter the 6-digit code sent to{" "}
          {emailForOtp || otpForm.getValues("email")}
        </Text>
      </>
    );
  };

  return (
    <SafeAreaView style={onboardingStyles.container}>
      <KeyboardAvoidingView
        style={onboardingStyles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={onboardingStyles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Toggle */}
          {mode !== "otp" && (
            <View style={onboardingStyles.toggleContainer}>
              <Pressable
                style={[
                  onboardingStyles.toggleButton,
                  mode === "login" && onboardingStyles.toggleButtonActive,
                ]}
                onPress={() => {
                  setMode("login");
                  setServerMessage(null);
                }}
              >
                <Text
                  style={[
                    onboardingStyles.toggleText,
                    mode === "login" && onboardingStyles.toggleTextActive,
                  ]}
                >
                  Sign In
                </Text>
              </Pressable>

              <Pressable
                style={[
                  onboardingStyles.toggleButton,
                  mode === "signup" && onboardingStyles.toggleButtonActive,
                ]}
                onPress={() => {
                  setMode("signup");
                  setServerMessage(null);
                }}
              >
                <Text
                  style={[
                    onboardingStyles.toggleText,
                    mode === "signup" && onboardingStyles.toggleTextActive,
                  ]}
                >
                  Sign Up
                </Text>
              </Pressable>
            </View>
          )}

          {/* Header */}
          <View style={onboardingStyles.headerSection}>{renderHeader()}</View>

          {/* Server / Success message */}
          {serverMessage ? (
            <View style={onboardingStyles.errorContainer}>
              <MaterialIcons
                name={
                  serverMessage.toLowerCase().includes("sent") ||
                  serverMessage.toLowerCase().includes("resent")
                    ? "check-circle"
                    : "error-outline"
                }
                size={18}
                color={
                  serverMessage.toLowerCase().includes("sent") ||
                  serverMessage.toLowerCase().includes("resent")
                    ? COLORS.success
                    : COLORS.error
                }
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  onboardingStyles.errorText,
                  serverMessage.toLowerCase().includes("sent") ||
                  serverMessage.toLowerCase().includes("resent")
                    ? { color: COLORS.success }
                    : {},
                ]}
              >
                {serverMessage}
              </Text>
            </View>
          ) : null}

          {/* LOGIN */}
          {mode === "login" && (
            <>
              <InputField
                control={loginForm.control}
                name="email"
                label="Email address"
                placeholder="you@example.com"
                keyboardType="email-address"
                iconName="mail-outline"
                autoCapitalize="none"
              />

              <InputField
                control={loginForm.control}
                name="password"
                label="Password"
                placeholder="Enter your password"
                secureTextEntry
                iconName="lock-outline"
              />

              <AuthButtons
                primaryLabel="Sign In"
                onPrimaryPress={loginForm.handleSubmit(handleLogin)}
                primaryLoading={loading}
                secondaryLabel="Continue with Google"
                onSecondaryPress={handleGoogle}
                secondaryIconName="login"
                showDivider
              />
            </>
          )}

          {/* SIGNUP */}
          {mode === "signup" && (
            <>
              <InputField
                control={signupForm.control}
                name="email"
                label="Email address"
                placeholder="you@example.com"
                keyboardType="email-address"
                iconName="mail-outline"
                autoCapitalize="none"
              />

              <InputField
                control={signupForm.control}
                name="username"
                label="Username"
                placeholder="Choose a username"
                iconName="person-outline"
              />

              <InputField
                control={signupForm.control}
                name="password"
                label="Password"
                placeholder="********"
                secureTextEntry
                iconName="lock-outline"
              />

              <AuthButtons
                primaryLabel="Create Account"
                onPrimaryPress={signupForm.handleSubmit(handleSignup)}
                primaryLoading={loading}
                secondaryLabel="Continue with Google"
                onSecondaryPress={handleGoogle}
                secondaryIconName="login"
                showDivider
              />
            </>
          )}

          {/* OTP */}
          {mode === "otp" && (
            <>
              <InputField
                control={otpForm.control}
                name="otp"
                label="Verification code"
                placeholder="000000"
                keyboardType="numeric"
                iconName="lock-outline"
                inputProps={{ maxLength: 6 }}
              />

              <AuthButtons
                primaryLabel="Verify"
                onPrimaryPress={otpForm.handleSubmit(handleVerifyOtp)}
                primaryLoading={otpLoading}
                showDivider={false}
              />

              <View style={onboardingStyles.resendContainer}>
                <Pressable onPress={handleResend} disabled={otpLoading}>
                  <Text style={onboardingStyles.resendText}>
                    Didn&apos;t receive a code?{" "}
                    <Text style={onboardingStyles.resendLink}>Resend OTP</Text>
                  </Text>
                </Pressable>
              </View>

              <Pressable
                style={({ pressed }) => [
                  onboardingStyles.backButton,
                  pressed && onboardingStyles.backButtonPressed,
                ]}
                onPress={() => {
                  setMode("signup");
                  setServerMessage(null);
                  otpForm.reset();
                }}
              >
                <MaterialIcons
                  name="arrow-back"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={onboardingStyles.backButtonText}>
                  Choose Different Account
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
