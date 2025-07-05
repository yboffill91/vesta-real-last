"use client";

import { useState } from "react";
import { useMenus } from "@/hooks/useMenus";
import { MenuCreateForm } from "@/components/dashboard/menus/MenuCreateForm";
import { MenuTable } from "@/components/dashboard/menus/MenuTable";
import { FormWrapper } from "@/components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/Buttons";
import { PlusCircle } from "lucide-react";

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
    ? menus.filter(menu => Array.isArray(status) 
        ? status.includes(menu.status) 
        : menu.status === status || status === "all")
    : [];
    
  // Estado cero - Sin menús disponibles
  if (!loading && filteredMenus.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="bg-muted/30 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No hay menús disponibles</h3>
          <p className="text-muted-foreground mb-4">
            No se encontraron menús en estado de borrador o publicados.
            Crea un nuevo menú para comenzar.
          </p>
          <Button onClick={onCreateMenu} className="mx-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Crear nuevo menú
          </Button>
        </div>
      </div>
    );
  }
  
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
