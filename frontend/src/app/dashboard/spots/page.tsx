import { SpotsServicesTables } from "@/components/dashboard/spots/SpotsServicesTables";
import React from "react";
import { FormWrapper } from "@/components/ui";

const ServicesPotsPage = () => {
  return (
    <FormWrapper title="Gestión de Puestos de Servicio">
      <SpotsServicesTables />
    </FormWrapper>
  );
};

export default ServicesPotsPage;
