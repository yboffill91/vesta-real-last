/**
 * Cliente API para comunicación con el backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type ApiError = {
  detail: string;
  status: number;
};

export type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  token?: string;
  query?: Record<string, string>;
};

/**
 * Función principal para realizar peticiones a la API
 * 
 * @param endpoint Ruta del endpoint (sin incluir URL base)
 * @param options Opciones de la petición
 * @returns Datos de la respuesta, parseados como JSON
 */
export function getAuthToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const authStorage = localStorage.getItem('vestasys-auth-storage');
  if (!authStorage) return undefined;
  try {
    const { state } = JSON.parse(authStorage);
    return state?.token;
  } catch {
    return undefined;
  }
}

export async function fetchApi<T = any>(endpoint: string, options: FetchOptions = {}): Promise<{ success: boolean; data?: T; error?: string; status?: number }> {
  // Concatenar la URL base si es necesario
  const baseUrl = endpoint.startsWith('http')
    ? endpoint
    : `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const { 
    method = 'GET', 
    body, 
    token, 
    query = {} 
  } = options;
  
  // Construir headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Agregar token de autenticación si existe, o usar el token por defecto
  const authToken = token || getAuthToken();
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  // Construir URL con query params si existen
  const queryParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  const queryString = queryParams.toString();
  const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

  // Logger para depuración
  if (typeof window !== 'undefined') {
    // Solo log en cliente
    console.log('[fetchApi] URL:', url, 'Method:', method, 'Body:', body);
  }

  // Configuración de la petición
  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };
  
  // Agregar body si existe y no es GET
  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, config);

    // Si la respuesta es 204 No Content, retorna success true sin data
    if (response.status === 204) {
      return { success: true, data: undefined, status: 204 };
    }
    // Si la respuesta es 201 Created o 200 OK pero no hay body, retorna success true sin data
    const text = await response.text();
    if (!text) {
      return { success: true, data: undefined, status: response.status };
    }
    // Intenta parsear el JSON
    let data: T;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      return { success: false, error: 'Respuesta inválida del servidor', status: response.status };
    }
    // Si status HTTP no es ok, retorna error pero sin lanzar excepción
    if (!response.ok) {
      let errorMsg = `Error ${response.status}`;
      if (data && typeof data === 'object') {
        if ('detail' in data && typeof (data as any).detail === 'string') {
          errorMsg = (data as any).detail;
        } else if ('message' in data && typeof (data as any).message === 'string') {
          errorMsg = (data as any).message;
        }
      }
      return { success: false, error: errorMsg, status: response.status, data };
    }
    // Éxito
    return { success: true, data, status: response.status };
  } catch (error) {
    // Error de red u otro
    let msg = 'Error de conexión';
    if (error instanceof Error) {
      msg = error.message;
    }
    return { success: false, error: msg };
  }
}