"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Loader2, Pencil, Trash } from "lucide-react";
import { SystemAlert } from "@/components/ui/system-alert";

import { useUsers } from "@/hooks/use-users";
import { useDeleteUser } from "@/hooks/use-user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";

import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/Select";
import { Button } from "@/components/ui/Buttons";

import { useRouter } from "next/navigation";

export function UserTable() {
  const { users, loading, error, reload } = useUsers();
  const [showAlert, setShowAlert] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  // Para eliminar usuario
  const [deleteTarget, setDeleteTarget] = useState<null | { id: number; name: string }>();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const { deleteUser, loading: deleting, error: deleteError, success: deleteSuccess } = useDeleteUser();

  // Mostrar alerta si hay error
  useEffect(() => {
    if (error) setShowAlert(true);
  }, [error]);

  // Filtrado de usuarios
  const filteredUsers = users.filter((user) => {
    const matchesName = user.name
      .toLowerCase()
      .includes(nameFilter.toLowerCase());
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    return matchesName && matchesRole;
  });

  const router = useRouter();

  // Manejar feedback de eliminación
  useEffect(() => {
    if (deleteSuccess) {
      setShowDeleteAlert(false);
      reload();
    }
  }, [deleteSuccess, reload]);

  useEffect(() => {
    if (deleteError) setShowDeleteAlert(true);
  }, [deleteError]);

  return (
    <>
      {/* Alerta de error general */}
      <SystemAlert
        open={showAlert}
        setOpen={setShowAlert}
        title="Error al cargar usuarios"
        description={error || "No se pudieron obtener los usuarios."}
        confirmText="Aceptar"
        variant="destructive"
        onConfirm={() => setShowAlert(false)}
      />
      {/* Alerta de confirmación/eliminación */}
      <SystemAlert
        open={!!deleteTarget}
        setOpen={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={deleteError ? "Error al eliminar usuario" : "¿Eliminar usuario?"}
        description={
          deleteError
            ? deleteError
            : deleteTarget
            ? `¿Estás seguro que deseas eliminar a "${deleteTarget.name}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmText={deleteError ? "Cerrar" : deleting ? "Eliminando..." : "Eliminar"}
        cancelText={deleteError ? undefined : "Cancelar"}
        variant={deleteError ? "destructive" : "default"}
        onConfirm={async () => {
          if (deleteTarget && !deleteError) {
            await deleteUser(deleteTarget.id);
            reload(); // Siempre recarga tras intentar eliminar
          } else {
            setDeleteTarget(null);
            reload(); // También recarga si hay error o no hay target
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Usuarios registrados</h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="size-6 animate-spin mr-2" />
              <span>Cargando usuarios...</span>
            </div>
          ) : (
            <>
              {/* Filtros */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <Input
                  placeholder="Filtrar por nombre"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="max-w-xs"
                />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Filtrar por rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Soporte">Soporte</SelectItem>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Dependiente">Dependiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Apellido</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5}>
                          No hay usuarios registrados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.surname}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={user.role === "Soporte"}
                                onClick={() =>
                                  router.push(
                                    `/dashboard/users/edit/${user.id}`
                                  )
                                }
                              >
                                <Pencil className=" h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={user.role === "Soporte" || deleting}
                                onClick={() => setDeleteTarget({ id: Number(user.id), name: user.name + ' ' + user.surname })}
                              >
                                {deleting && deleteTarget?.id === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
