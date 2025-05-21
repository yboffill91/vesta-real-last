"use client";
import { UsersList } from "@/components/dashboard/support/users-list";
import { Separator } from "@/components/ui";
import { DashboardCards } from "@/components/ui/dashboard-cards";
import {
  Users,
  ShoppingCart,
  List,
  Store,
  Map,
  Utensils,
  LayoutGrid,
} from "lucide-react";
import { ReactNode } from "react";

export default function AdministratorDashboard() {
  return (
    <main className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {/* Administración */}
        <DashboardCards title="Gestión de Usuarios" icon={Users}>
          <UsersList />
        </DashboardCards>
        {/* Establecimiento */}
        <DashboardCards title="Áreas de Venta" icon={Store}>
          <div className="text-sm">
            Gestiona las diferentes áreas de venta del establecimiento.
          </div>
        </DashboardCards>
        <DashboardCards title="Puestos de Servicio" icon={Map}>
          <div className="text-sm">
            Administra los puestos de servicio disponibles.
          </div>
        </DashboardCards>
        {/* Productos */}
        <DashboardCards title="Gestión de Productos" icon={ShoppingCart}>
          <div className="text-sm">
            Administra el catálogo de productos disponibles.
          </div>
        </DashboardCards>
        <DashboardCards title="Gestión de Categorías" icon={LayoutGrid}>
          <div className="text-sm">Organiza los productos en categorías.</div>
        </DashboardCards>
        <DashboardCards title="Gestión de Menús" icon={Utensils}>
          <div className="text-sm">Crea y edita menús para los clientes.</div>
        </DashboardCards>
        {/* Órdenes */}
        <DashboardCards title="Gestión de Órdenes" icon={List}>
          <div className="text-sm">
            Visualiza y gestiona las órdenes activas y pasadas.
          </div>
        </DashboardCards>
      </div>
    </main>
  );
}
