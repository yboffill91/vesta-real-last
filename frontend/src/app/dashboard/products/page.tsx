"use client";

import { useState } from "react";
import { ProductTable } from "@/components/dashboard/products/ProductTable";
import { ProductCreateForm } from "@/components/dashboard/products/ProductCreateForm";
import { FormWrapper } from "@/components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <FormWrapper title="Gestión de Productos">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Lista de Productos</TabsTrigger>
          <TabsTrigger value="create">Crear Nuevo Producto</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-2">
          <ProductTable />
        </TabsContent>

        <TabsContent value="create" className="mt-2">
          <div className="rounded-md shadow p-4">
            <ProductCreateForm onSuccess={() => setActiveTab("list")} />
          </div>
        </TabsContent>
      </Tabs>
    </FormWrapper>
  );
}
