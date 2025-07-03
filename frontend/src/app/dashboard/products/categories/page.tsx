"use client";

import { Metadata } from "next";
import { useState } from "react";
import { CategoryTable } from "@/components/dashboard/categories/CategoryTable";
import { CategoryCreateForm } from "@/components/dashboard/categories/CategoryCreateForm";
import { FormWrapper } from "@/components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <FormWrapper title="Gestión de Categorías de Productos">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Lista de Categorías</TabsTrigger>
          <TabsTrigger value="create">Crear Nueva Categoría</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-2">
          <CategoryTable />
        </TabsContent>

        <TabsContent value="create" className="mt-2">
          <div className="rounded-md shadow p-4">
            <CategoryCreateForm />
          </div>
        </TabsContent>
      </Tabs>
    </FormWrapper>
  );
}
