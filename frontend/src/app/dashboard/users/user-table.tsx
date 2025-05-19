"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Loader2 } from "lucide-react";
import { SystemAlert } from "@/components/ui/system-alert";

interface User {
  id: number;
  name: string;
  surname: string;
  username: string;
  role: string;
}

export function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      setError(null);
      const { success, data, error } = await fetchApi<User[]>("/api/v1/users/");
      if (!success) {
        setError(error || "No se pudieron obtener los usuarios");
        setShowAlert(true);
      } else if (Array.isArray(data)) {
        setUsers(data);
      }
      setLoading(false);
    };
    getUsers();
  }, []);

  return (
    <>
      <SystemAlert
        open={showAlert}
        setOpen={setShowAlert}
        title="Error al cargar usuarios"
        description={error || "No se pudieron obtener los usuarios."}
        confirmText="Aceptar"
        variant="destructive"
        onConfirm={() => setShowAlert(false)}
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
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-4 py-2 text-left">Nombre</th>
                    <th className="px-4 py-2 text-left">Apellido</th>
                    <th className="px-4 py-2 text-left">Usuario</th>
                    <th className="px-4 py-2 text-left">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-4 text-muted-foreground"
                      >
                        No hay usuarios registrados.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="px-4 py-2">{user.name}</td>
                        <td className="px-4 py-2">{user.surname}</td>
                        <td className="px-4 py-2">{user.username}</td>
                        <td className="px-4 py-2">{user.role}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
