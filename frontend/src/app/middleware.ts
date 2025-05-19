import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/auth'];

// Rutas protegidas que requieren autenticación
const protectedRoutes = ['/dashboard'];

// Función para verificar si una ruta es pública
const isPublicRoute = (path: string) => {
  return publicRoutes.some(route => path === route || path.startsWith(`${route}/`));
};

// Función para verificar si una ruta está protegida
const isProtectedRoute = (path: string) => {
  return protectedRoutes.some(route => path === route || path.startsWith(`${route}/`));
};

// Función para extraer el rol del token JWT
const getUserRoleFromToken = (token: string): string | null => {
  try {
    const payload = token.split('.')[1];
    if (payload) {
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
      return decoded.role || null;
    }
  } catch (e) {
    console.error('Error al decodificar el token JWT:', e);
  }
  return null;
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('auth_token')?.value;
  const isAuthenticated = !!authToken;
  
  // Verificar si la ruta es pública
  if (isPublicRoute(pathname)) {
    // Si el usuario ya está autenticado y trata de acceder a una ruta de autenticación,
    // redirigir al dashboard
    if (isAuthenticated && pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Permitir el acceso a rutas públicas
    return NextResponse.next();
  }

  // Si el usuario intenta acceder a una ruta protegida sin autenticación
  if (!isAuthenticated && (isProtectedRoute(pathname) || pathname === '/')) {
    // Redirigir a /auth si no está autenticado
    const loginUrl = new URL('/auth', request.url);
    // Guardar la URL actual para redirigir después del login (excepto si es la raíz)
    if (pathname !== '/') {
      loginUrl.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Si el usuario está autenticado pero intenta acceder a la raíz,
  // redirigir al dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Si llegamos hasta aquí, permitir el acceso a la ruta solicitada
  return NextResponse.next();
}

// Configurar el middleware para que se aplique a todas las rutas
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.webp$).*)',
  ],
};
