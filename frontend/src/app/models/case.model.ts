export interface Case {
  id: number;
  client_id: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  urgencia: 'baja' | 'media' | 'alta';
  estado: 'abierto' | 'en_proceso' | 'cerrado';
  created_at: string;
  updated_at: string;
  client_nombre?: string;
  client_email?: string;
  applications_count?: number;
  user_applied?: number;
}

export interface CreateCaseRequest {
  titulo: string;
  descripcion: string;
  tipo: string;
  urgencia: 'baja' | 'media' | 'alta';
}

export interface Application {
  id: number;
  case_id: number;
  lawyer_id: number;
  mensaje?: string;
  fecha: string;
  lawyer_nombre?: string;
  lawyer_email?: string;
  matricula?: string;
  especialidades?: string[];
  verificado?: boolean;
}

export interface Message {
  id: number;
  case_id: number;
  from_user_id: number;
  to_user_id: number;
  contenido: string;
  fecha: string;
  from_nombre?: string;
  to_nombre?: string;
}

export interface SendMessageRequest {
  toUserId: number;
  contenido: string;
}
