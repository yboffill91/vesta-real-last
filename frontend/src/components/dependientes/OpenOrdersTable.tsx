import React, { useEffect } from "react";
import { useOrders } from "@/hooks/useOrders";
import { Order } from "@/models/order";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "../ui/table";

export const OpenOrdersTable: React.FC = () => {
  const { fetchOrders, loading, error, data } = useOrders();

  useEffect(() => {
    fetchOrders({ status: "abierta" });
    // Refresco automático cada 20s
    const interval = setInterval(
      () => fetchOrders({ status: "abierta" }),
      20000
    );
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const orders: Order[] = Array.isArray(data?.data) ? data.data : [];

  return (
    <div className="w-full mx-auto bg-muted p-4 rounded-lg">
      <Table>
        <TableCaption>Órdenes abiertas</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Mesa</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Cargando órdenes...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={5} className="text-destructive text-center">
                Error: {error}
              </TableCell>
            </TableRow>
          ) : orders.length > 0 ? (
            orders.map((order: Order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.service_spot_id}</TableCell>
                <TableCell>{order.sales_area_id}</TableCell>
                <TableCell className="capitalize">{order.status}</TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleString()}
                </TableCell>
                <TableCell>{order.total ?? 0}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-muted-foreground text-center"
              >
                No hay órdenes abiertas.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
