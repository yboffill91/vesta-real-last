import { useState } from "react";
import { fetchApi } from "@/lib/api";

export function useTokenLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const loginWithToken = async (formData: {
    username: string;
    password: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const body = new URLSearchParams();
      body.append("username", formData.username);
      body.append("password", formData.password);
      const response = await fetchApi("/api/auth/token", {
        method: "POST",
        body,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
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

  return { loginWithToken, loading, error, data };
}
