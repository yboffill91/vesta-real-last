import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { User } from "@/models/User.types";

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useUsers(): UseUsersResult {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUsers = async () => {
    setLoading(true);
    setError(null);
    const { success, data, error } = await fetchApi<any>("/api/v1/users/");
    if (!success) {
      setError(error || "No se pudieron obtener los usuarios");
    } else if (data && Array.isArray(data.data)) {
      setUsers(data.data);
    } else if (Array.isArray(data)) {
      setUsers(data);
    } else {
      setError("Formato inesperado de respuesta de usuarios");
    }
    setLoading(false);
  };

  useEffect(() => {
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { users, loading, error, reload: getUsers };
}
