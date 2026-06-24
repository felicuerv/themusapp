export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'cliente' | 'abogado' | 'admin';
  created_at?: string;
}

export interface LawyerProfile {
  id: number;
  user_id: number;
  matricula?: string;
  especialidades?: string[];
  bio?: string;
  verificado: boolean;
  ciudad?: string;
}

export interface ClientProfile {
  id: number;
  user_id: number;
  ciudad?: string;
  telefono?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  rol: 'cliente' | 'abogado';
}
