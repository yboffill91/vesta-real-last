import { useState } from "react";
import { fetchApi } from "@/lib/api";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const login = async (loginData: { username: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(loginData),
        headers: { "Content-Type": "application/json" },
      });
      setData(response);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error, data };
}
