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

import { useAuthStore } from "@/store/auth";
import { useOnboardingStore } from "@/store/onboarding";
import { useExperimentStore } from "@/store/experiment";
import {
  startExperiment,
  updateBaseline,
  getCurrentExperiment,
} from "@/api/experiments";
import { getMe } from "@/api/auth";

interface Onboarding5Props {
  pagerRef: React.RefObject<any>;
}

// TODO: Add real colored google icon in continue with google button

export default function Onboarding5({ pagerRef }: Onboarding5Props) {
  const [mode, setMode] = useState<"login" | "signup" | "otp">("login");
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [emailForOtp, setEmailForOtp] = useState("");

  const { login, register, verifyOtp, resendOtp, isLoading } = useAuthStore();
  const { baseline, experiment, reset } = useOnboardingStore();

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

    const { fetchCurrent } = useExperimentStore.getState();

    try {
      const res = await login(data);

      if (res.success) {
        // ✅ Always sync experiment from backend
        await fetchCurrent();

        const { current } = useExperimentStore.getState();
        const hasActiveExperiment = !!current;

        // ✅ Only create if none exists
        if (!hasActiveExperiment && experiment) {
          // Save baseline
          await updateBaseline({
            sleep_score: baseline.sleepQualityScore,
            focus_score: baseline.focusScore,
            mood_score: baseline.moodScore,
            phone_hours: baseline.phoneHours,
            exercise_score: baseline.exerciseScore,
            confidence_score: baseline.confidenceScore,
          });

          // Create experiment
          const startRes = await startExperiment({
            title: experiment,
            duration_days: 7,
          });

          if (!startRes.ok) {
            console.log("Experiment creation failed:", startRes.error);
          }

          const me = await getMe();
          const userId = me.data.id;

          useOnboardingStore.persist.setOptions({
            name: `onboarding-storage-${userId}`,
          });

          await useOnboardingStore.persist.rehydrate();

          // 🔥 Refetch after creation
          await fetchCurrent();
        }

        pagerRef.current?.setPage(5);
        reset();
      } else {
        setServerMessage(res.error || "Login failed, Please try again.");
      }
    } catch (err: any) {
      setServerMessage(err?.message ?? "Login failed. Please try again.");
    }
  };

  const handleSignup: SubmitHandler<RegisterRequest> = async (data) => {
    setServerMessage(null);
    try {
      const res = await register(data);

      if (res.success) {
        setEmailForOtp(data.email);
        otpForm.setValue("email", data.email);
        setMode("otp");
        setServerMessage("Verification code sent to your email.");
      } else {
        setServerMessage(res.error || "Signup failed");
      }
    } catch (err: any) {
      setServerMessage(err?.message ?? "Signup failed. Please try again.");
    } finally {
    }
  };

  const handleVerifyOtp: SubmitHandler<VerifyOtpRequest> = async (data) => {
    setServerMessage(null);

    const { fetchCurrent } = useExperimentStore.getState();

    try {
      const res = await verifyOtp(data);

      if (res.success) {
        // ✅ Sync experiment
        await fetchCurrent();

        const { current } = useExperimentStore.getState();
        const hasActiveExperiment = !!current;

        if (!hasActiveExperiment && experiment) {
          await updateBaseline({
            sleep_score: baseline.sleepQualityScore,
            focus_score: baseline.focusScore,
            mood_score: baseline.moodScore,
            phone_hours: baseline.phoneHours,
            exercise_score: baseline.exerciseScore,
            confidence_score: baseline.confidenceScore,
          });

          const startRes = await startExperiment({
            title: experiment,
            duration_days: 7,
          });

          if (!startRes.ok) {
            console.log("Experiment creation failed:", startRes.error);
          }

          const me = await getMe();
          const userId = me.data.id;

          useOnboardingStore.persist.setOptions({
            name: `onboarding-storage-${userId}`,
          });

          await useOnboardingStore.persist.rehydrate();

          useOnboardingStore.getState().reset();

          // 🔥 Refetch again
          await fetchCurrent();
        }

        pagerRef.current?.setPage(5);
        reset();
      } else {
        setServerMessage(res.error || "Invalid OTP");
      }
    } catch (err: any) {
      setServerMessage(
        err?.message ?? "Verification failed. Please try again.",
      );
    }
  };

  const handleResend = async () => {
    if (!emailForOtp) {
      setServerMessage("No email available to resend OTP.");
      return;
    }
    setServerMessage(null);
    try {
      const res = await resendOtp({ email: emailForOtp });

      if (res.success) {
        setServerMessage("OTP resent. Check your email.");
      } else {
        setServerMessage(res.error || "Failed to resend OTP.");
      }
    } catch (err: any) {
      setServerMessage(err?.message ?? "Failed to resend OTP.");
    } finally {
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
                primaryLoading={isLoading}
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
                primaryLoading={isLoading}
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
                primaryLoading={isLoading}
                showDivider={false}
              />

              <View style={onboardingStyles.resendContainer}>
                <Pressable onPress={handleResend} disabled={isLoading}>
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
