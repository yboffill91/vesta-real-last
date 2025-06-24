"use client";

import { SpotsServicesTables } from "@/components/dashboard/spots/SpotsServicesTables";
import { ServiceSpotCreateForm } from "@/components/dashboard/spots/ServiceSpotCreateForm";
import React, { useState } from "react";
import { FormWrapper } from "@/components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const ServicesPotsPage = () => {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <FormWrapper title="Gestión de Puestos de Servicio">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Lista de Puestos</TabsTrigger>
          <TabsTrigger value="create">Crear Nuevo Puesto</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-2">
          <SpotsServicesTables />
        </TabsContent>

        <TabsContent value="create" className="mt-2">
          <div className=" rounded-md shadow p-4">
            <ServiceSpotCreateForm />
          </div>
        </TabsContent>
      </Tabs>
    </FormWrapper>
  );
};

export default ServicesPotsPage;
