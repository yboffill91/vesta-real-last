import type { Metadata } from "next";
import "./globals.css";


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
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
