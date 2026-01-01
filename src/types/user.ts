export interface User {
  _id?: string;
  name: string;
  username: string;
  email: string;
  password?: string; // Optional because we don't want to expose it in responses
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  resetToken?: string;
  resetTokenExpiry?: Date;
}

export interface CreateUserData {
  name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Omit<User, 'password'>;
  token?: string;
}
