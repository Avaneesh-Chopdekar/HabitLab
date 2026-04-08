import { create } from "zustand";
import {
  login as loginApi,
  register as registerApi,
  verifyOtp as verifyOtpApi,
  resendOtp as resendOtpApi,
  googleLogin as googleLoginApi,
  getMe,
} from "../api/auth";
import { getAccessToken, clearTokens } from "../utils/token";
import { useOnboardingStore } from "./onboarding";

type AuthResult = { success: true } | { success: false; error: string };

type User = {
  id: number;
  email: string;
  username: string;
  is_verified: boolean;
};

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  user: User | null;

  login: (data: any) => Promise<AuthResult>;
  register: (data: any) => Promise<AuthResult>;
  verifyOtp: (data: any) => Promise<AuthResult>;
  resendOtp: (data: any) => Promise<AuthResult>;
  googleLogin: (data: any) => Promise<AuthResult>;

  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,
  user: null,

  hydrate: async () => {
    const token = await getAccessToken();

    if (!token) {
      set({ isAuthenticated: false, user: null, isHydrated: true });
      return;
    }

    const res = await getMe();

    if (res.ok) {
      set({
        isAuthenticated: true,
        user: res.data,
        isHydrated: true,
      });
    } else {
      set({
        isAuthenticated: false,
        user: null,
        isHydrated: true,
      });
    }
  },

  login: async (data) => {
    set({ isLoading: true });

    const res = await loginApi(data);

    set({ isLoading: false });

    if (res.ok) {
      set({ isAuthenticated: true });
      const me = await getMe();
      if (me.ok) {
        set({ user: me.data });
      }
      return { success: true };
    }

    return { success: false, error: res.error || "Login failed" };
  },

  register: async (data) => {
    set({ isLoading: true });

    const res = await registerApi(data);

    set({ isLoading: false });

    if (res.ok) {
      return { success: true };
    }

    return { success: false, error: res.error || "Registration failed" };
  },

  verifyOtp: async (data) => {
    set({ isLoading: true });

    const res = await verifyOtpApi(data);

    set({ isLoading: false });

    if (res.ok) {
      set({ isAuthenticated: true });
      const me = await getMe();
      if (me.ok) {
        set({ user: me.data });
      }
      return { success: true };
    }

    return { success: false, error: res.error || "Invalid OTP" };
  },

  resendOtp: async (data) => {
    set({ isLoading: true });

    const res = await resendOtpApi(data);

    set({ isLoading: false });

    if (res.ok) {
      return { success: true };
    }

    return { success: false, error: res.error || "Failed to resend OTP" };
  },

  googleLogin: async (data) => {
    set({ isLoading: true });

    const res = await googleLoginApi(data);

    set({ isLoading: false });

    if (res.ok) {
      set({ isAuthenticated: true });
      const me = await getMe();
      if (me.ok) {
        set({ user: me.data });
      }
      return { success: true };
    }

    return { success: false, error: res.error || "Google login failed" };
  },

  logout: async () => {
    await clearTokens();

    useOnboardingStore.getState().reset();

    set({
      user: null,
      isAuthenticated: false,
    });
  },
}));
