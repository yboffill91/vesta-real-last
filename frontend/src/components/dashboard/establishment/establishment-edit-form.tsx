import React, { useState } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RootInput } from "@/components/ui/root-input";
import { RootTextarea } from "@/components/ui";
import { UploadFile } from "@/components/ui/upload-file";
import { Button } from "@/components/ui/Buttons";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/Select";
import { useEditEstablishment } from "@/hooks/use-establishment";
import { SystemAlert } from "@/components/ui/system-alert";

const establishmentEditSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio").max(64),
  address: z.string().min(4, "La dirección es obligatoria").max(128),
  phone: z.string().min(6, "Debe ingresar un teléfono válido").max(32),
  logo: z.string().optional(),
  tax_rate: z.coerce.number().min(0, "Debe ser un número positivo").max(100),
  currency: z.enum(["CUP", "USD"]),
});

type EstablishmentEditFormValues = z.infer<typeof establishmentEditSchema>;

interface EstablishmentEditFormProps {
  initialData: EstablishmentEditFormValues & { logo: string };
  onSuccess?: () => void;
}

export function EstablishmentEditForm({
  initialData,
  onSuccess,
}: EstablishmentEditFormProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const { editEstablishment, loading, error, success } = useEditEstablishment();

  const methods = useForm<EstablishmentEditFormValues>({
    defaultValues: initialData,
    resolver: zodResolver(establishmentEditSchema),
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = methods;

  // SystemAlert state
  const [showAlert, setShowAlert] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);

  const handleLogoUpload = async (): Promise<string> => {
    if (!logoFile) return initialData.logo;
    const formData = new FormData();
    formData.append("file", logoFile);
    const uploadRes = await fetch("/api/upload-logo", {
      method: "POST",
      body: formData,
    });
    const uploadJson = await uploadRes.json();
    if (!uploadRes.ok || !uploadJson.url) {
      throw new Error(uploadJson.error || "Error al subir logo");
    }
    return uploadJson.url;
  };

  const onSubmit = async (data: EstablishmentEditFormValues) => {
    try {
      const logoUrl = await handleLogoUpload();
      const payload = {
        ...data,
        logo: logoUrl,
        is_configured: true,
      };
      await editEstablishment(payload);
      setSuccessAlert(true);
      setShowAlert(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setSuccessAlert(false);
      setShowAlert(true);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-col gap-6 max-w-xl mx-auto w-full"
        onSubmit={handleSubmit(onSubmit)}
      >
        <RootInput
          label="Nombre del establecimiento"
          htmlFor="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <RootTextarea
          label="Dirección"
          htmlFor="address"
          error={errors.address?.message}
          {...register("address")}
        />
        <RootInput
          label="Teléfono principal de contacto"
          htmlFor="phone"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <UploadFile
          id="logo"
          label="Logo"
          file={logoFile}
          setFile={setLogoFile}
          accept=".png,.jpg,.jpeg,.webp"
        />
        <RootInput
          label="% Propina"
          htmlFor="tax_rate"
          type="number"
          step="1"
          error={errors.tax_rate?.message}
          {...register("tax_rate", { valueAsNumber: true })}
        />
        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUP">CUP</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <Button
          type="submit"
          className="w-full mt-6"
          disabled={isSubmitting || loading || !isDirty}
        >
          Actualizar Establecimiento
        </Button>
      </form>
      <SystemAlert
        open={showAlert}
        setOpen={setShowAlert}
        title={
          successAlert
            ? "Establecimiento actualizado"
            : "Error al actualizar establecimiento"
        }
        description={
          successAlert
            ? "Los datos del establecimiento se guardaron correctamente."
            : error || "Ocurrió un error al guardar los cambios."
        }
        variant={successAlert ? "default" : "destructive"}
      />
    </FormProvider>
  );
}
