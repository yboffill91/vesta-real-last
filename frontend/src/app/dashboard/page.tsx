"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DashboardCards,
} from "@/components/ui";
import { UsersList } from "@/components/dashboard/support/users-list";
import { BadgeCheck, Home, Users } from "lucide-react";

export default function SupportDashboard() {
  return (
    <main className="container mx-auto p-6 space-y-2">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCards title="Gestión de Usuarios" icon={Users}>
          <UsersList />
        </DashboardCards>
        <DashboardCards title="Gestión de Establecimiento" icon={Home}>
          <div className="text-2xl font-bold">Datos del Establecimiento</div>
          <p className="text-xs text-muted-foreground">
            Configura la información de tu negocio
          </p>
        </DashboardCards>
        <DashboardCards title="Licencia" icon={BadgeCheck}>
          <div className="text-2xl font-bold">Licencia Activa</div>
          <p className="text-xs text-muted-foreground">Vigencia: 31/12/2024</p>
        </DashboardCards>
      </div>
    </main>
  );
}
