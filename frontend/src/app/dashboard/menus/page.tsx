"use client";

import { useState } from "react";
import { useMenus } from "@/hooks/useMenus";
import { MenuCreateForm } from "@/components/dashboard/menus/MenuCreateForm";
import { MenuTable } from "@/components/dashboard/menus/MenuTable";
import { FormWrapper } from "@/components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Componente para mostrar menús filtrados por estado con manejo de estado cero
const FilteredMenuTable = ({
  status,
  title,
  onCreateMenu,
}: {
  status: string | string[];
  title: string;
  onCreateMenu: () => void;
}) => {
  const { menus, loading } = useMenus();

  // Filtrar menús por estado
  const filteredMenus = Array.isArray(menus)
    ? menus.filter((menu) =>
        Array.isArray(status)
          ? status.includes(menu.status)
          : menu.status === status || status === "all"
      )
    : [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <MenuTable initialStatusFilter={status} />
    </div>
  );
};

export default function MenusPage() {
  const [activeTab, setActiveTab] = useState("draft");

  const handleCreateMenuClick = () => {
    setActiveTab("create");
  };

  return (
    <FormWrapper title="Gestión de Menús">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="draft">Menús</TabsTrigger>
          <TabsTrigger value="create">Crear Menú</TabsTrigger>
        </TabsList>

        <TabsContent value="draft" className="mt-2">
          <FilteredMenuTable
            status="borrador"
            title="Edición de Menús"
            onCreateMenu={handleCreateMenuClick}
          />
        </TabsContent>

        <TabsContent value="create" className="mt-2">
          <div className="rounded-md shadow p-4">
            <MenuCreateForm onSuccess={() => setActiveTab("draft")} />
          </div>
        </TabsContent>
      </Tabs>
    </FormWrapper>
  );
}
