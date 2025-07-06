import React, { useState } from "react";
import { useOrderStore } from "@/store/orderStore";
import {
  Button,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "../ui";
import {
  CircleDashed,
  CircleOff,
  NotebookPen,
  Plus,
  Save,
  Trash,
} from "lucide-react";
import { CreateOrderButton } from "./CreateOrderButton";

export const OrderRectifyTable: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => {
  const {
    products,
    setProductQuantity,
    setProductNote,
    removeProduct,
    crossProduct,
    uncrossProduct,
  } = useOrderStore();
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [noteValue, setNoteValue] = useState("");

  const handleEditNote = (productId: number, currentNote?: string) => {
    setEditingNote(productId);
    setNoteValue(currentNote || "");
  };

  const handleSaveNote = (productId: number) => {
    setProductNote(productId, noteValue);
    setEditingNote(null);
    setNoteValue("");
  };

  return (
    <div className="w-full mx-auto bg-muted p-4 rounded-lg">
      <Button onClick={onBack} variant="secondary">
        <Plus />
        Agregar Productos
      </Button>
      <Table className="w-full border-collapse bg-background rounded shadow mt-12">
        <TableCaption>Rectificar Comanda</TableCaption>
        <TableHeader>
          <TableRow className="bg-muted text-muted-foreground">
            <TableHead>Producto</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Notas</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow
              key={p.product_id}
              className={
                p.crossed
                  ? "line-through text-muted-foreground bg-muted/50"
                  : ""
              }
            >
              <TableCell>
                <h3 className="font-semibold text-lg">{p.product_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {p.category_name}
                </p>
              </TableCell>
              <TableCell>
                <span className="font-mono">${p.price.toFixed(2)}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    size={"icon"}
                    variant="outline"
                    onClick={() =>
                      setProductQuantity(
                        p.product_id,
                        Math.max(0, p.quantity - 1)
                      )
                    }
                    disabled={p.crossed}
                  >
                    -
                  </Button>
                  <span className="mx-2 w-6 text-center">{p.quantity}</span>
                  <Button
                    size={"icon"}
                    variant="outline"
                    onClick={() =>
                      setProductQuantity(p.product_id, p.quantity + 1)
                    }
                    disabled={p.crossed}
                  >
                    +
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                {editingNote === p.product_id ? (
                  <div className="flex gap-2 items-center">
                    <input
                      className="border px-2 py-1 rounded"
                      value={noteValue}
                      onChange={(e) => setNoteValue(e.target.value)}
                      autoFocus
                    />
                    <Button
                      size={"icon"}
                      variant="default"
                      onClick={() => handleSaveNote(p.product_id)}
                    >
                      <Save />
                    </Button>
                    <Button
                      size={"icon"}
                      variant="outline"
                      onClick={() => setEditingNote(null)}
                    >
                      <CircleOff />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <span>
                      {p.notes || (
                        <span className="text-xs text-muted-foreground">
                          Sin nota
                        </span>
                      )}
                    </span>
                    <Button
                      size={"icon"}
                      variant="default"
                      onClick={() => handleEditNote(p.product_id, p.notes)}
                      disabled={p.crossed}
                    >
                      <NotebookPen />
                    </Button>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex  gap-1">
                  {p.crossed ? (
                    <Button
                      size={"icon"}
                      variant="default"
                      onClick={() => uncrossProduct(p.product_id)}
                    >
                      <CircleOff />
                    </Button>
                  ) : (
                    <Button
                      size={"icon"}
                      variant="outline"
                      onClick={() => crossProduct(p.product_id)}
                    >
                      ---
                    </Button>
                  )}
                  <Button
                    size={"icon"}
                    variant="destructive"
                    onClick={() => removeProduct(p.product_id)}
                  >
                    <Trash />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5} className="text-right text-lg font-bold">
              Subtotal: $
              {products
                .filter((p) => !p.crossed)
                .reduce((acc, p) => acc + p.price * p.quantity, 0)
                .toFixed(2)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <div className="flex justify-end mt-6">
        <CreateOrderButton />
      </div>
    </div>
  );
};
