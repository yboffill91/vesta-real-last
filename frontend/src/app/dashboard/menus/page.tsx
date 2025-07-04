"use client";

import { useState } from "react";
import { MenuCreateForm } from "@/components/dashboard/menus/MenuCreateForm";
import { MenuTable } from "@/components/dashboard/menus/MenuTable";
import { FormWrapper } from "@/components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function MenusPage() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <FormWrapper title="Gestión de Menús">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Lista de Menús</TabsTrigger>
          <TabsTrigger value="create">Crear Nuevo Menú</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-2">
          <MenuTable />
        </TabsContent>

        <TabsContent value="create" className="mt-2">
          <div className="rounded-md shadow p-4">
            <MenuCreateForm onSuccess={() => setActiveTab("list")} />
          </div>
        </TabsContent>
      </Tabs>
    </FormWrapper>
  );
}
