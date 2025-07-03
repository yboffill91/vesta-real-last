"use client";

import { useParams } from "next/navigation";
import { ProductEditForm } from "@/components/dashboard/products/ProductEditForm";
import { Button } from "@/components/ui/Buttons";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FormWrapper } from "@/components/ui";

export default function EditProductPage() {
  const params = useParams();
  const productId = Number(params.id);

  if (isNaN(productId)) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/dashboard/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="size-4 mr-2" />
              Volver a productos
            </Button>
          </Link>
        </div>
        <div className="p-4 bg-destructive/10 rounded-md text-destructive">
          ID de producto no válido
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <FormWrapper title="Editar Producto">
        <Link href="/dashboard/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="size-4 mr-2" />
            Volver a productos
          </Button>
        </Link>

        <ProductEditForm productId={productId} />
      </FormWrapper>
    </div>
  );
}
