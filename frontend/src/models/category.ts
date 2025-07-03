export interface Category {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  establishment_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  is_active?: boolean;
  establishment_id?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}
