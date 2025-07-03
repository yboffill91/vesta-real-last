import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Establishment {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EstablishmentState {
  establishment: Establishment | null;
  setEstablishment: (establishment: Establishment | null) => void;
}

// Store de establecimiento siguiendo el patrón del proyecto
export const useEstablishmentStore = create<EstablishmentState>()(persist(
  (set) => ({
    establishment: null,
    setEstablishment: (establishment) => set({ establishment }),
  }),
  {
    name: 'vestasys-establishment-storage',
    partialize: (state) => ({ establishment: state.establishment }),
  }
));
