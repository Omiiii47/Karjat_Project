export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Optional because we don't want to expose it in responses
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  role: 'user' | 'admin';
  isVerified: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
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
