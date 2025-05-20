"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EstablishmentEditForm } from "@/components/dashboard/establishment/establishment-edit-form";
import { useEstablishment } from "@/hooks/use-establishment";
import { FormWrapper } from "@/components/ui";

const EstablishmentPage = () => {
  const router = useRouter();
  const { establishment, loading, error } = useEstablishment();

  useEffect(() => {
    if (!loading && !establishment) {
      router.replace("/dashboard/establishment/add");
    }
  }, [loading, establishment, router]);

  if (loading) {
    return <div className="text-center mt-10">Cargando establecimiento...</div>;
  }
  if (error) {
    return <div className="text-destructive text-center mt-10">{error}</div>;
  }
  if (!establishment) {
    return null;
  }

  // Map API fields to form fields (asegura que estén todos los campos requeridos)
  const allowedCurrencies = ["CUP", "USD"] as const;
  const currencyValue = allowedCurrencies.includes(
    establishment.currency as any
  )
    ? (establishment.currency as "CUP" | "USD")
    : "CUP";

  const initialData = {
    name: establishment.name || "",
    address: establishment.address || "",
    phone: establishment.phone || "",
    logo: establishment.logo || "",
    tax_rate: establishment.tax_rate ?? 0,
    currency: currencyValue,
  };

  return (
    // <div className="py-8">
    //   <h1 className="text-2xl font-bold mb-6">Editar Establecimiento</h1>
    //   <EstablishmentEditForm initialData={initialData} onSuccess={() => {}} />
    // </div>
    <FormWrapper title="Editar el Establecimiento">
      <EstablishmentEditForm initialData={initialData} onSuccess={() => {}} />
    </FormWrapper>
  );
};

export default EstablishmentPage;
