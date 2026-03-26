export type ApiResult<T> =
  | { ok: true; data?: T }
  | {
      ok: false;
      error: string;
      field?: "email" | "password" | "username" | "otp";
    };
