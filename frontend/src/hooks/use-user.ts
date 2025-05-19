import { useEffect, useState, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { User } from "@/models/User.types";

// Hook para obtener un usuario por id
export function useUser(userId: string | number) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { success, data, error } = await fetchApi(`/api/v1/users/${userId}`);
    if (!success) {
      setError(error || "No se pudo obtener el usuario");
      setUser(null);
    } else if (data && data.data) {
      setUser(data.data);
    } else if (data) {
      setUser(data);
    } else {
      setError("Usuario no encontrado");
      setUser(null);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) getUser();
  }, [userId, getUser]);

  return { user, loading, error, reload: getUser };
}

// Hook para actualizar un usuario por id
export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateUser = useCallback(async (userId: string | number, payload: Partial<User> & { id: number }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    const { success, error } = await fetchApi(`/api/v1/users/${userId}`, {
      method: "PUT",
      body: payload,
    });
    setLoading(false);
    setSuccess(!!success);
    if (!success) setError(error || "No se pudo actualizar el usuario");
    return success;
  }, []);

  return { updateUser, loading, error, success };
}
