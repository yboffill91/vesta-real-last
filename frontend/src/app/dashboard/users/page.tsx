import { UsersList } from "@/components/dashboard/support/users-list";
import { UserTable } from "@/components/dashboard/users/user-table";
import { FormWrapper } from "@/components/ui";

const UsersPage = () => {
  return (
    <FormWrapper title="Gestión de Usuarios">
      <UserTable />
    </FormWrapper>
  );
};

export default UsersPage;
