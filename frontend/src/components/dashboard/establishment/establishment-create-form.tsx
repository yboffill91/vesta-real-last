"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RootTextarea } from "@/components/ui";
import { Form } from "@/components/ui/Form";
import { RootInput } from "@/components/ui/root-input";
import { Button } from "@/components/ui";
import { Loader2 } from "lucide-react";
import { SystemAlert } from "@/components/ui/system-alert";
import { fetchApi } from "@/lib/api";
import { UploadFile } from "@/components/ui/upload-file";
import { useRouter } from "next/navigation";

const establishmentSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio").max(64),
  address: z.string().min(4, "La dirección es obligatoria").max(128),
  phone: z.string().min(6, "Debe ingresar un teléfono válido").max(32),
  logo: z.string().optional(),
});

type EstablishmentFormValues = z.infer<typeof establishmentSchema>;

type EstablishmentApiPayload = {
  name: string;
  address: string;
  phone: string;
  logo: string;
  tax_rate: number;
  currency: string;
  is_configured: boolean;
};

export function EstablishmentCreateForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successAlert, setSuccessAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const methods = useForm<EstablishmentFormValues>({
    resolver: zodResolver(establishmentSchema),
    mode: "onBlur",
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = methods;

  const onSubmit = async (data: EstablishmentFormValues) => {
    setServerError(null);
    setLoading(true);
    try {
      let logoUrl = "";
      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        const uploadRes = await fetch("/api/upload-logo", {
          method: "POST",
          body: formData,
        });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok || !uploadJson.url) {
          setServerError(uploadJson.error || "Error al subir logo");
          setShowAlert(true);
          setLoading(false);
          return;
        }
        logoUrl = uploadJson.url;
      }
      const payload: EstablishmentApiPayload = {
        name: data.name,
        address: data.address,
        phone: data.phone,
        logo: logoUrl,
        tax_rate: 0,
        currency: "CUP",
        is_configured: true,
      };
      const { success, error } = await fetchApi("/api/v1/establishment/", {
        method: "POST",
        body: payload,
      });
      if (!success) {
        setServerError(error || "Error al crear establecimiento");
        setShowAlert(true);
        setLoading(false);
        return;
      }
      reset();
      setLogoFile(null);
      setSuccessAlert(true);
      setShowAlert(true);
      setLoading(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setServerError(err?.message || "Error de red");
      setShowAlert(true);
      setLoading(false);
    }
  };

  return (
    <>
      <SystemAlert
        open={showAlert}
        setOpen={setShowAlert}
        title={
          successAlert
            ? "Establecimiento creado"
            : "Error al crear establecimiento"
        }
        description={
          successAlert
            ? "El establecimiento se creó correctamente."
            : serverError || "Ocurrió un error inesperado."
        }
        confirmText="Aceptar"
        variant={successAlert ? "default" : "destructive"}
        onConfirm={() => {
          setShowAlert(false);
          setServerError(null);
          setSuccessAlert(false);
        }}
      />

      <Form {...methods}>
        <form
          className="flex flex-col gap-6 max-w-xl mx-auto"
          onSubmit={handleSubmit(onSubmit)}
        >
          <RootInput
            label="Nombre del establecimiento"
            htmlFor="name"
            error={errors.name?.message}
            {...register("name")}
            placeholder="Ej: Cafetería Central"
          />
          <RootTextarea
            label="Dirección"
            htmlFor="address"
            error={errors.address?.message}
            {...register("address")}
            placeholder="Ej: Calle 123, Ciudad"
            rows={5}
          />
          <RootInput
            label="Teléfono principal de contacto"
            htmlFor="phone"
            error={errors.phone?.message}
            {...register("phone")}
            placeholder="Ej: +53 5555 5555"
          />
          <UploadFile
            id="logo"
            label="Logo"
            file={logoFile}
            setFile={setLogoFile}
            accept=".png,.jpg,.jpeg,.webp"
          />
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span className="ml-2">Creando establecimiento...</span>
                </>
              ) : (
                "Crear establecimiento"
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full mt-6"
              onClick={router.back}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
