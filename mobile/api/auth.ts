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

export const login = async ({ email, password }: LoginRequest) => {
  const res = await api.post<LoginResponse>("/api/auth/login/", {
    email,
    password,
  });
  await saveTokens(res.data.access, res.data.refresh);
};

export const register = async ({
  email,
  username,
  password,
}: RegisterRequest) => {
  await api.post<RegisterResponse>("/api/auth/register/", {
    email,
    username,
    password,
  });
};

export const verifyOtp = async ({ email, otp }: VerifyOtpRequest) => {
  const res = await api.post<LoginResponse>("/api/auth/verify-otp/", {
    email,
    otp,
  });
  await saveTokens(res.data.access, res.data.refresh);
};

export const resendOtp = async ({ email }: ResendOtpRequest) =>
  await api.post("/api/auth/resend-otp/", { email });

export const googleLogin = async ({ idToken }: GoogleLoginRequest) => {
  const res = await api.post("/api/auth/google/", { token: idToken });
  await saveTokens(res.data.access, res.data.refresh);
};
