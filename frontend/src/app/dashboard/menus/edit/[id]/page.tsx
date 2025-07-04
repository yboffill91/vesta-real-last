"use client";

import { useParams } from "next/navigation";
import { MenuEditForm } from "@/components/dashboard/menus/MenuEditForm";
import { FormWrapper } from "@/components/ui";

export default function EditMenuPage() {
  const params = useParams();
  const menuId = Number(params.id);

  return (
    <FormWrapper title="Editar Menú">
      <MenuEditForm menuId={menuId} />
    </FormWrapper>
  );
}
