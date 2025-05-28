"use client";
import { useAuthStore } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "./Buttons";
import Image from "next/image";

export const HomeButton = () => {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  if (!user) return null;

  const handleClick = () => {
    if (user.role === "Administrador") {
      router.push("/dashboard/admin");
    } else if (user.role === "Soporte") {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        onClick={handleClick}
        className="inline-flex items-center"
      >
        <Image src={"/logo.webp"} width={32} height={32} alt="VestaSys" />
        <h3>Vesta Manager</h3>
      </Button>
    </div>
  );
};
