"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui";
import { ServiceSpotCreateForm } from "@/components/dashboard/spots/ServiceSpotCreateForm";
import { FormWrapper } from "@/components/ui";

export default function AddServiceSpotPage() {
  return (
    <FormWrapper title="Crear Puesto de Servicio">
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Datos del puesto</CardTitle>
        </CardHeader>
        <ServiceSpotCreateForm />
      </Card>
    </FormWrapper>
  );
}
