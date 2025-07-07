import { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableFooter } from "../ui/table";

import { Order, OrderItem } from "@/models/order";

interface OrderDetailProps {
  orderId: string;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener la orden");
        return res.json();
      })
      .then((data) => {
        setOrder({
          ...data,
          items: data.items.map((item: any) => ({
            ...item,
            subtotal: item.price * item.quantity,
          })),
        } as Order);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div>Cargando orden...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!order) return <div>No se encontró la orden.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Orden #{order.order_id}</h2>
      <div className="mb-4 text-sm text-muted-foreground">
        Mesa: {order.service_spot_id} | Área: {order.sales_area_id} | Estado: {order.status} | Fecha: {new Date(order.created_at).toLocaleString()}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Producto</TableCell>
            <TableCell>Cantidad</TableCell>
            <TableCell>Nota</TableCell>
            <TableCell>Precio</TableCell>
            <TableCell>Subtotal</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.product_name}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.note || "-"}</TableCell>
              <TableCell>${item.price.toFixed(2)}</TableCell>
              <TableCell>${item.subtotal.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4} className="text-right font-bold">
              Total
            </TableCell>
            <TableCell className="font-bold">${order.total.toFixed(2)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <div className="flex gap-4 mt-6">
        <button className="btn btn-primary">Editar orden</button>
        <button className="btn btn-secondary">Cerrar orden</button>
      </div>
    </div>
  );
}
