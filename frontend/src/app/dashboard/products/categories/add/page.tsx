import { Metadata } from 'next';
import { CategoryCreateForm } from '@/components/dashboard/categories/CategoryCreateForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Buttons';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Añadir Categoría | Vesta',
  description: 'Crear una nueva categoría de productos',
};

export default function AddCategoryPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Crear Categoría</h1>
        <Link href="/dashboard/products/categories">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Volver a Categorías
          </Button>
        </Link>
      </div>
      <CategoryCreateForm />
    </div>
  );
}