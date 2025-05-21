"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  DashboardCardAlert,
} from "@/components/ui";

import { TriangleAlertIcon } from "lucide-react";
import Link from "next/link";

import { useUsers } from "@/hooks/use-users";

export function UsersList() {
  const { users, loading: isLoading, error, reload } = useUsers();
  const filteredUsers = users.filter((user) => user.role !== "Soporte");
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-destructive/20 border border-destructive/20 text-destructive px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  // Check if there's only the default support user
  if (users.length <= 1) {
    return (
      <DashboardCardAlert
        title="No hay usuarios creados"
        alert="No ha configurado un usuario administrador todavía."
        action="Crear Usuario Administrador"
        link="/dashboard/users/add"
        variant="warning"
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Rol</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map(({ id, name, surname, role }) => (
            <TableRow key={id}>
              <TableCell>{`${name} ${surname}`}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-px rounded-lg  ${
                    role === "Administrador"
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-accent-foreground"
                  }`}
                >
                  {role}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
