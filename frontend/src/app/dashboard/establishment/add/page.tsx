import { DashboardCards, FormWrapper } from "@/components/ui";
import { Home } from "lucide-react";
import { EstablishmentCreateForm } from "@/components/dashboard/establishment/establishment-create-form";

export default function AddEstablishmentPage() {
  return (
    <div className="container mx-auto p-6">
      <FormWrapper
        title="Agregar Establecimiento"
        subtitle="Complete los datos para registrar un nuevo establecimiento"
      >
        <EstablishmentCreateForm />
      </FormWrapper>
    </div>
  );
}
