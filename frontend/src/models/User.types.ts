export interface User {
  id: string | number;
  name: string;
  surname: string;
  username: string;
  email?: string;
  role: "Soporte" | "Administrador" | "Usuario";
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
