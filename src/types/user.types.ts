export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: "admin" | "user";
  created_at: string;
}

export interface UserInput {
  username: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface JWTPayload {
  id: number;
  username: string;
  email: string;
  role: "admin" | "user";
  iat?: number;
  exp?: number;
}

export interface AuthRequest {
  user?: JWTPayload;
}
