"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
} from "@/components/ui";

import { TriangleAlertIcon } from "lucide-react";
import Link from "next/link";

import { useUsers } from "@/hooks/use-users";

export function UsersList() {
  const { users, loading: isLoading, error, reload } = useUsers();

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
      <div className="text-center p-8">
        <div className="bg-yellow-500/10 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <TriangleAlertIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-500">
                No ha configurado un usuario administrador todavía.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Button variant="default" asChild>
            <Link href="/dashboard/users/add">Crear Usuario Administrador</Link>
          </Button>
        </div>
      </div>
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
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === "Administrador"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {user.role}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
