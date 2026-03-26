import * as z from "zod";

// Password validation schema with strong constraints
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password cannot exceed 128 characters")
  .refine(
    (password) => /[A-Z]/.test(password),
    "Password must contain at least one uppercase letter",
  )
  .refine(
    (password) => /[a-z]/.test(password),
    "Password must contain at least one lowercase letter",
  )
  .refine(
    (password) => /[0-9]/.test(password),
    "Password must contain at least one number",
  )
  .refine(
    (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    "Password must contain at least one special character (!@#$%^&*()_+-=[]{}...)",
  )
  .refine(
    (password) => !/(.)\1{2,}/.test(password),
    "Password cannot contain 3 or more consecutive identical characters",
  )
  .refine(
    (password) =>
      !/^(123456|password|qwerty|abc123|letmein|welcome)/i.test(password),
    "Password is too common. Please choose a stronger password",
  );

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type LoginRequest = z.infer<typeof loginSchema>;

export type LoginResponse = {
  access: string;
  refresh: string;
};

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    )
    .refine(
      (username) => !/^[0-9]/.test(username),
      "Username cannot start with a number",
    ),
  password: passwordSchema,
});

export type RegisterRequest = z.infer<typeof registerSchema>;

export type RegisterResponse = {
  username: string;
  email: string;
};

export const resendOtpSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase(),
});

export type ResendOtpRequest = z.infer<typeof resendOtpSchema>;

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase(),
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export type VerifyOtpRequest = z.infer<typeof verifyOtpSchema>;

export const googleLoginSchema = z.object({
  idToken: z.string().min(1, "Google ID token is required"),
});

export type GoogleLoginRequest = z.infer<typeof googleLoginSchema>;
