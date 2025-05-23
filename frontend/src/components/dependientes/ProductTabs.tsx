"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useCategoriesWithProducts,
  CategoryWithProducts,
  ProductInCategory,
} from "@/hooks/useCategoriesWithProducts";
import { ProductCard } from "./ProductCard";

interface ProductTabsProps {
  selectedProducts: { [productId: number]: number };
  onAdd: (product: ProductInCategory) => void;
  onRemove: (product: ProductInCategory) => void;
}

export function ProductTabs({
  selectedProducts,
  onAdd,
  onRemove,
}: ProductTabsProps) {
  const { categories, loading, error } = useCategoriesWithProducts();

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div className="text-destructive">{error}</div>;
  // Filtrar solo categorías con productos
  const categoriesWithProducts = categories.filter(
    (cat) => cat.products && cat.products.length > 0
  );

  if (!categoriesWithProducts.length) {
    return <div>No hay productos disponibles.</div>;
  }

  return (
    <Tabs
      defaultValue={categoriesWithProducts[0]?.id.toString()}
      className="w-full"
    >
      <TabsList className="flex flex-row gap-2 mb-4 flex-wrap">
        {categoriesWithProducts.map((cat) => (
          <TabsTrigger
            key={cat.id}
            value={cat.id.toString()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded min-w-28"
          >
            {cat.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {categoriesWithProducts.map((cat) => (
        <TabsContent
          key={cat.id}
          value={cat.id.toString()}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {cat.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={selectedProducts[product.id] || 0}
              onAdd={onAdd}
              onRemove={onRemove}
            />
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}
