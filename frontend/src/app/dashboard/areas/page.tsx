"use client";

import AddSalesAreaForm from "@/components/dashboard/areas/add-sales-area-form";
import SalesAreasTable from "@/components/dashboard/areas/sales-areas-table";
import { FormWrapper } from "@/components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";

export default function SalesAreasPage() {
  const [activeTab, setActiveTab] = useState("list");
  return (
    <FormWrapper title="Gestión de Áreas de Venta">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Lista de Áreas</TabsTrigger>
          <TabsTrigger value="create">Crear Nueva Área</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-2">
          <SalesAreasTable />
        </TabsContent>

        <TabsContent value="create" className="mt-2">
          <div className="rounded-md shadow p-4">
            <AddSalesAreaForm />
          </div>
        </TabsContent>
      </Tabs>
    </FormWrapper>
  );
}
