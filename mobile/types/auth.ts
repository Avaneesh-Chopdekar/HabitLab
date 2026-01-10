import * as z from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be atleast 8 characters long")
    .max(128, "Password cannot exceed 128 characters"),
});

export type LoginRequest = z.infer<typeof loginSchema>;

export type LoginResponse = {
  access: string;
  refresh: string;
};

export const registerSchema = z.object({
  email: z.email("Invalid email address"),
  username: z.string().nonempty(),
  password: z
    .string()
    .min(8, "Password must be atleast 8 characters long")
    .max(128, "Password cannot exceed 128 characters"),
});

export type RegisterRequest = z.infer<typeof registerSchema>;

export type RegisterResponse = {
  username: string;
  email: string;
};

export const resendOtpSchema = z.object({
  email: z.email("Invalid email address"),
});

export type ResendOtpRequest = z.infer<typeof resendOtpSchema>;

export const verifyOtpSchema = z.object({
  email: z.email("Invalid email address"),
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

export type VerifyOtpRequest = z.infer<typeof verifyOtpSchema>;

export const googleLoginSchema = z.object({
  idToken: z.string().nonempty(),
});

export type GoogleLoginRequest = z.infer<typeof googleLoginSchema>;
