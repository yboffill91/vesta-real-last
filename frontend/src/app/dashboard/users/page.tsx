"use client";
import { UserCreateForm } from "@/components/dashboard/users/user-create-form";
import { UserTable } from "@/components/dashboard/users/user-table";
import { FormWrapper } from "@/components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";

const UsersPage = () => {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <FormWrapper title="Gestión de Usuarios">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Lista de Usuarios</TabsTrigger>
          <TabsTrigger value="create">Crear Nuevo Usuario</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-2">
          <UserTable />
        </TabsContent>

        <TabsContent value="create" className="mt-2">
          <div className="rounded-md shadow p-4">
            <UserCreateForm onSuccess={() => setActiveTab("list")} />
          </div>
        </TabsContent>
      </Tabs>
    </FormWrapper>
  );
};

export default UsersPage;
