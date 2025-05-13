import { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Configuración Inicial - VestaSys",
  description: "Wizard de configuración inicial para el sistema VestaSys",
}

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col items-center">
      <header className=" container max-w-3xl rounded-b-lg mx-auto bg-card border shadow text-center">
        <div className="container flex items-center justify-center">
          <Image src="/logo.webp" alt="VestaSys Logo" className=" object-contain"  width={64} height={64}/>
          <h1 className="text-xl font-semibold">VestaSys</h1>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
