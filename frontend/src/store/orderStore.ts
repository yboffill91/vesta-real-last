import { create } from "zustand";
import { Order, OrderItem, OrderStatus } from "@/models/order";

export interface OrderProduct {
  id: number;
  product_id: number;
  product_name: string;
  category_id: number;
  category_name: string;
  price: number;
  quantity: number;
  notes?: string;
  crossed?: boolean;
}

export interface OrderMeta {
  sales_area_id: number | null;
  service_spot_id: number | null;
  menu_id: number | null;
}

interface OrderState {
  products: OrderProduct[];
  meta: OrderMeta;
  setMeta: (meta: Partial<OrderMeta>) => void;
  addProduct: (product: Omit<OrderProduct, "quantity">) => void;
  removeProduct: (product_id: number) => void;
  setProductQuantity: (product_id: number, quantity: number) => void;
  setProductNote: (product_id: number, note: string) => void;
  crossProduct: (product_id: number) => void;
  uncrossProduct: (product_id: number) => void;
  clear: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  products: [],
  meta: {
    sales_area_id: null,
    service_spot_id: null,
    menu_id: null,
  },
  setMeta: (meta) => set((state) => ({ meta: { ...state.meta, ...meta } })),
  addProduct: (product) => {
    set((state) => {
      const existing = state.products.find(
        (p) => p.product_id === product.product_id
      );
      if (existing) {
        return {
          products: state.products.map((p) =>
            p.product_id === product.product_id
              ? { ...p, quantity: p.quantity + 1, crossed: false }
              : p
          ),
        };
      }
      return {
        products: [
          ...state.products,
          { ...product, quantity: 1, crossed: false },
        ],
      };
    });
  },
  removeProduct: (product_id) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.product_id === product_id ? { ...p, crossed: true } : p
      ),
    }));
  },
  setProductQuantity: (product_id, quantity) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.product_id === product_id ? { ...p, quantity, crossed: quantity === 0 ? true : p.crossed } : p
      ),
    }));
  },
  setProductNote: (product_id, note) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.product_id === product_id ? { ...p, notes: note } : p
      ),
    }));
  },
  crossProduct: (product_id) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.product_id === product_id ? { ...p, crossed: true } : p
      ),
    }));
  },
  uncrossProduct: (product_id) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.product_id === product_id ? { ...p, crossed: false } : p
      ),
    }));
  },
  clear: () => set({ products: [], meta: { sales_area_id: null, service_spot_id: null, menu_id: null } }),
}));
