import { SpotsServicesTables } from "@/components/dashboard/spots/SpotsServicesTables";
import React from "react";
import { FormWrapper, Button } from "@/components/ui";
import { Plus } from "lucide-react";
import Link from "next/link";

const ServicesPotsPage = () => {
  return (
    <FormWrapper title="Gestión de Puestos de Servicio">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Puestos disponibles</h2>
        <Link href="/dashboard/spots/add">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Crear Puesto
          </Button>
        </Link>
      </div>
      <SpotsServicesTables />
    </FormWrapper>
  );
};

export default ServicesPotsPage;
