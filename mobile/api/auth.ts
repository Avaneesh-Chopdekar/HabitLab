import api from ".";
import { saveTokens } from "../utils/token";
import {
  RegisterResponse,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  VerifyOtpRequest,
  ResendOtpRequest,
  GoogleLoginRequest,
} from "../types/auth";

export const login = async (data: LoginRequest) => {
  try {
    const res = await api.post<LoginResponse>("/api/auth/login/", data);

    await saveTokens(res.data.access, res.data.refresh);

    return { ok: true };
  } catch (err: any) {
    if (!err.response) {
      return { ok: false, error: "Network error" };
    }

    if (err.response.status === 401) {
      return { ok: false, error: "Invalid credentials" };
    }

    return { ok: false, error: err.response.data?.detail || "Login failed" };
  }
};

export const register = async (data: RegisterRequest) => {
  try {
    await api.post("/api/auth/register/", data);
    return { ok: true };
  } catch (err: any) {
    if (!err.response) {
      return { ok: false, error: "Network error" };
    }

    const body = err.response.data;

    if (body.email) return { ok: false, error: body.email[0] };
    if (body.username) return { ok: false, error: body.username[0] };
    if (body.password) return { ok: false, error: body.password[0] };

    return { ok: false, error: "Registration failed" };
  }
};
export const verifyOtp = async (data: VerifyOtpRequest) => {
  try {
    const res = await api.post<LoginResponse>("/api/auth/verify-otp/", data);

    await saveTokens(res.data.access, res.data.refresh);

    return { ok: true };
  } catch (err: any) {
    if (!err.response) {
      return { ok: false, error: "Network error" };
    }

    const body = err.response.data;

    return { ok: false, error: body.error || "Invalid OTP" };
  }
};
export const resendOtp = async (data: ResendOtpRequest) => {
  try {
    await api.post("/api/auth/resend-otp/", data);
    return { ok: true };
  } catch (err: any) {
    if (!err.response) {
      return { ok: false, error: "Network error" };
    }

    return { ok: false, error: err.response.data?.error || "Try again later" };
  }
};
export const googleLogin = async (data: GoogleLoginRequest) => {
  try {
    const res = await api.post<LoginResponse>("/api/auth/google/", {
      token: data.idToken,
    });

    await saveTokens(res.data.access, res.data.refresh);

    return { ok: true };
  } catch (err: any) {
    if (!err.response) {
      return { ok: false, error: "Network error" };
    }

    return { ok: false, error: "Google login failed" };
  }
};

export const getMe = async () => {
  try {
    const res = await api.get("/api/auth/me/");
    return { ok: true, data: res.data };
  } catch (err: any) {
    return { ok: false, error: "Failed to fetch user" };
  }
};
