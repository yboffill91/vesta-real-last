import { Metadata } from 'next';
import { CategoryEditForm } from '@/components/dashboard/categories/CategoryEditForm';

export const metadata: Metadata = {
  title: 'Editar Categoría | Vesta',
  description: 'Editar una categoría de productos existente',
};

interface CategoryEditPageProps {
  params: {
    id: string;
  };
}

export default function EditCategoryPage({ params }: CategoryEditPageProps) {
  const categoryId = parseInt(params.id);
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Editar Categoría</h1>
      <CategoryEditForm categoryId={categoryId} />
    </div>
  );
}
