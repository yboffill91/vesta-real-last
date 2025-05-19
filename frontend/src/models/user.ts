// Esquema general de usuario y derivados para inputs
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'soporte' | 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipado para formulario de login
export type UserLoginInput = Pick<User, 'username'> & { password: string };

// Tipado para crear usuario
export type UserCreateInput = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> & {
  password: string;
};
