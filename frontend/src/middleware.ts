import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


// Rutas públicas que no requieren autenticación
const publicRoutes = ['/login'];

// Función para verificar si una ruta es pública
const isPublicRoute = (path: string) => {
  return publicRoutes.some(route => path === route || path.startsWith(`${route}/`));
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Obtener el token de autenticación de la cookie 'auth_token'
  const token = request.cookies.get('auth_token')?.value;

  // Verificar si hay alguna información de autenticación
  const hasAuthData = Boolean(token);
  
  // Decodificar JWT para extraer el rol
  let userRole = null;
  if (token) {
    try {
      // JWT: header.payload.signature
      const payload = token.split('.')[1];
      if (payload) {
        const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
        userRole = decoded.role || null;
      }
    } catch (e) {
      console.error('Error al decodificar el JWT:', e);
    }
  }

  // Si es una ruta pública, permitir el acceso
  if (isPublicRoute(pathname)) {
    // Si el usuario ya está autenticado y trata de acceder a login, redirigir al dashboard
    if (hasAuthData && pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Para rutas protegidas, verificar autenticación
  if (!hasAuthData) {
    // Redirigir a login si no hay token
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  // Verificar acceso a rutas restringidas por rol
  if (pathname.startsWith('/setup')) {
    // Solo el rol 'soporte' puede acceder a /setup
    if (userRole !== 'Soporte') {
      // Redirigir a la página principal si no tiene el rol adecuado
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Si está autenticado y tiene los permisos correctos, permitir acceso
  return NextResponse.next();
}

// Configurar el middleware para que se aplique a todas las rutas
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.webp$).*)',
  ],
};
