import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (item, quantity = 1, customization = "") => {
        set((state) => {
          // Check if same item with same customization already exists
          const existingItemIndex = state.items.findIndex(
            (i) => i.id === item.id && i.customization === customization
          );

          if (existingItemIndex >= 0) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += quantity;
            return { items: updatedItems };
          }

          return {
            items: [...state.items, { ...item, quantity, customization }],
          };
        });
      },

      removeFromCart: (itemId, customization = "") => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.id === itemId && i.customization === customization)
          ),
        }));
      },

      updateQuantity: (itemId, customization, newQuantity) => {
        if (newQuantity <= 0) {
          get().removeFromCart(itemId, customization);
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId && i.customization === customization
              ? { ...i, quantity: newQuantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      getTotalItems: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
