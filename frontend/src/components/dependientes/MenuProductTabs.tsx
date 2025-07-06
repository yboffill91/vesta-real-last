"use client";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Buttons";
import React, { useMemo } from "react";

export interface MenuProductTabsProps {
  products: Array<{
    id: number;
    product_id: number;
    product_name: string;
    price: number;
    is_available: boolean;
    category_id: number;
    category_name: string;
  }>;
  onAdd?: (product: any) => void;
}

export const MenuProductTabs: React.FC<MenuProductTabsProps> = ({ products, onAdd }) => {
  // Agrupar productos por categoría
  const categories = useMemo(() => {
    const grouped: Record<string, typeof products> = {};
    products.forEach((p) => {
      if (!grouped[p.category_name]) grouped[p.category_name] = [];
      grouped[p.category_name].push(p);
    });
    return grouped;
  }, [products]);

  const categoryNames = Object.keys(categories);

  if (categoryNames.length === 0) {
    return <div className="text-muted-foreground text-center py-4">No hay productos disponibles.</div>;
  }

  return (
    <Tabs defaultValue={categoryNames[0]} className="w-full">
      <TabsList className="flex gap-2 border-b mb-4">
        {categoryNames.map((cat) => (
          <TabsTrigger key={cat} value={cat} className="px-4 py-2">
            {cat}
          </TabsTrigger>
        ))}
      </TabsList>
      {categoryNames.map((cat) => (
        <TabsContent key={cat} value={cat} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {categories[cat].map((product) => (
            <Card key={product.id} className="bg-card/50 border">
              <CardHeader>
                <CardTitle>{product.product_name}</CardTitle>
                <CardDescription>${product.price.toFixed(2)}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="default"
                  className="w-full"
                  disabled={!product.is_available}
                  onClick={() => onAdd?.(product)}
                >
                  Agregar al pedido
                </Button>
                {!product.is_available && (
                  <div className="text-xs text-destructive mt-2">No disponible</div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
};
