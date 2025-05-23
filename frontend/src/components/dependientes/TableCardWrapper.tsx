"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from "@/components/ui";
import { useSalesAreas } from "@/hooks/useSalesAreas";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";

export const TableCardWrapper: React.FC = () => {
  const { areas, loading, error } = useSalesAreas();
  console.log("areas", areas);
  console.log("loading", loading);
  console.log("error", error);
  const router = useRouter();
  return (
    <>
      <div>
        <h2>Areas</h2>
        <Separator />
        <div className="flex flex-wrap gap-2">
          {areas.map((area) => (
            <div
              key={area.id}
              className="p-4 border rounded-lg bg-card/20 my-2 min-w-sm"
            >
              <h3>{area.name}</h3>
              <Separator />
              <div className="flex flex-wrap gap-2 p-6">
                {area.service_spots?.map((spot) => (
                  <Card
                    key={spot.id}
                    className={cn(
                      spot.status === "libre"
                        ? "bg-green-500/10 border-green-500 text-green-500"
                        : spot.status === "pedido_abierto"
                        ? "bg-primary/10 border-primary text-primary shadow"
                        : "bg-destructive text-destructive-foreground border-destructive",
                      "min-w-32 min-h-28 cursor-pointer"
                    )}
                    onClick={() => {
                      // Obtener user_id real desde auth
                      // eslint-disable-next-line @typescript-eslint/no-var-requires
                      const { user } = require("@/lib/auth").useAuthStore.getState();
                      if (!user) {
                        alert("Debes iniciar sesión para crear una orden.");
                        return;
                      }
                      const user_id = user.id;
                      router.push(`/dependientes/orden?spot_id=${
                        spot.id
                      }&mesa=${encodeURIComponent(
                        spot.name
                      )}&user_id=${user_id}`);
                    }}
                  >
                    <CardHeader>
                      <CardTitle>{spot.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{spot.description}</p>
                      <span className="text-xs text-muted-foreground capitalize">
                        {spot.status ?? "Desconocido"}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
