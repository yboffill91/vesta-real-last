import React from "react";
import { UserCreateForm } from "../user-create-form";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { UserTable } from "../user-table";

const AddUserPage = () => {
  return (
    <main className="container mx-auto py-6 space-y-6 max-w-4xl">
      <UserCreateForm />
      <Separator />
      <UserTable />
    </main>
  );
};

export default AddUserPage;
