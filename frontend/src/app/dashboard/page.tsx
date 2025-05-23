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
import { EstablishmentCard } from "@/components/dashboard/establishment/establishment-card";

export default function SupportDashboard() {
  return (
    <main className="container mx-auto p-6 space-y-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <DashboardCards title="Gestión de Usuarios" icon={Users}>
          <UsersList />
        </DashboardCards>
        <DashboardCards title="Gestión de Establecimiento" icon={Home}>
          <EstablishmentCard />
        </DashboardCards>
        <DashboardCards title="Licencia" icon={BadgeCheck}>
          <div className="text-2xl font-bold">Licencia Activa</div>
          <p className="text-xs text-muted-foreground">Vigencia: 31/12/2024</p>
        </DashboardCards>
      </div>
    </main>
  );
}
