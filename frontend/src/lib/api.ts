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

export async function fetchApi<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
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
    
    // Manejar errores HTTP
    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch (err) {
        // Si no se puede parsear la respuesta como JSON
        errorData = {
          detail: `Error ${response.status}: ${response.statusText}`,
          status: response.status
        };
      }
      
      const error = new Error(errorData.detail || 'Error en la petición a la API');
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }
    
    // Devolver los datos si todo está bien
    if (response.status !== 204) { // No Content
      return await response.json() as T;
    }
    
    return {} as T;
  } catch (error) {
    // Capturar errores de red u otros no relacionados con la respuesta HTTP
    if (!(error instanceof Error)) {
      throw new Error('Error de conexión');
    }
    throw error;
  }
}