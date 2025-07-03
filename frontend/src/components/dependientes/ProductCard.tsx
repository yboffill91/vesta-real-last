"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { ProductInCategory } from "@/hooks/useCategoriesWithProducts";
import { Button } from "../ui";

interface ProductCardProps {
  product: ProductInCategory;
  quantity: number;
  onAdd: (product: ProductInCategory) => void;
  onRemove: (product: ProductInCategory) => void;
}

export function ProductCard({
  product,
  quantity,
  onAdd,
  onRemove,
}: ProductCardProps) {
  return (
    <Card className="w-full relative flex flex-col">
      <CardHeader className="flex flex-col items-center pb-2">
        <CardTitle className="text-base text-center">{product.name}</CardTitle>
        <div className="text-sm text-muted-foreground mt-1">
          ${product.price.toFixed(2)}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col justify-center items-center py-2 gap-2">
        {/* Badge de cantidad seleccionada */}
        <span className="bg-primary text-white rounded-full min-w-12 min-h-12 flex items-center justify-center text-xl">
          {quantity}
        </span>
        
        {/* Descripción del producto */}
        {product.description && (
          <p className="text-xs text-center text-muted-foreground">
            {product.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-center gap-2 pt-2">
        <Button
          variant={"outline"}
          type="button"
          onClick={() => onRemove(product)}
          disabled={quantity === 0}
        >
          -
        </Button>
        <Button onClick={() => onAdd(product)}>+</Button>
      </CardFooter>
    </Card>
  );
}
