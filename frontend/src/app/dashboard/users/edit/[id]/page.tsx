import { UserEditForm } from "@/components/dashboard/users/user-edit-form";
import { Button } from "@/components/ui";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditUserPage({ params }: { params: { id: string } }) {
  const userId = params.id;

  if (!userId) {
    return (
      <div className="p-8 text-destructive">
        Falta el parámetro de usuario a editar.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-12">
      <Link href="/dashboard/users">
        <Button variant="outline" size="sm">
          <ArrowLeft className="size-4 mr-2" />
          Volver a usuarios
        </Button>
      </Link>

      <UserEditForm userId={userId} />
    </div>
  );
}
