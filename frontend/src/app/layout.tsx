import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthProvider";
import { ThemeProvider } from "@/contexts/ThemeProvider";

export const metadata: Metadata = {
  title: "TecnoTics SRL. Vesta System",
  description: "Sistema de Gestión Integral de Pequeños y Medianos Negocios de Gastronomía y Servicios Gastrnómicos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <ThemeProvider attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false} >

          {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
