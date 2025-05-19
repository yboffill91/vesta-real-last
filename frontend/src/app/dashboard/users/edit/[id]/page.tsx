import { UserEditForm } from "@/components/dashboard/users/user-edit-form";

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
      <UserEditForm userId={userId} />
    </div>
  );
}

