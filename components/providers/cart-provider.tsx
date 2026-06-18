"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CART_CLEARED_EVENT,
  cartItemCount,
  cartTotal,
  clearCartStorage,
  configSignature,
  getDefaultIngredients,
  loadCartFromStorage,
  saveCartToStorage,
  validateCartAdd,
} from "@/lib/cart-utils";
import { getMenuImageUrl } from "@/lib/menu-images";
import { requiresDetailBeforeAdd } from "@/lib/menu-config";
import type {
  CartLineItem,
  MenuItem,
  SelectedExtra,
  SelectedIngredient,
} from "@/lib/types";

type AddToCartOptions = {
  quantity?: number;
  selectedIngredients?: SelectedIngredient[];
  selectedSauce?: string;
  selectedExtras?: SelectedExtra[];
  specialInstructions?: string;
};

type CartContextValue = {
  lines: CartLineItem[];
  itemCount: number;
  total: number;
  hydrated: boolean;
  getQuantityForItem: (itemId: string) => number;
  getDefaultLineQuantity: (item: MenuItem) => number;
  addItem: (item: MenuItem, options?: AddToCartOptions) => boolean;
  addDefaultItem: (item: MenuItem) => boolean;
  removeDefaultItem: (item: MenuItem) => void;
  decrementItem: (item: MenuItem) => void;
  updateLineQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function createLineId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLineItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(loadCartFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveCartToStorage(lines);
  }, [lines, hydrated]);

  useEffect(() => {
    const handleCartCleared = () => setLines([]);
    window.addEventListener(CART_CLEARED_EVENT, handleCartCleared);
    return () => window.removeEventListener(CART_CLEARED_EVENT, handleCartCleared);
  }, []);

  const addItem = useCallback((item: MenuItem, options?: AddToCartOptions): boolean => {
    const selectedIngredients =
      options?.selectedIngredients ?? getDefaultIngredients(item);
    const selectedExtras = options?.selectedExtras ?? [];
    const selectedSauce = options?.selectedSauce;
    const specialInstructions = options?.specialInstructions?.trim() || undefined;
    const quantity = options?.quantity ?? 1;

    const validationError = validateCartAdd(item, selectedSauce);
    if (validationError) return false;

    const signature = configSignature(
      item._id,
      selectedIngredients,
      specialInstructions,
      selectedSauce,
      selectedExtras,
    );

    setLines((prev) => {
      const existing = prev.find(
        (line) =>
          configSignature(
            line.itemId,
            line.selectedIngredients,
            line.specialInstructions,
            line.selectedSauce,
            line.selectedExtras,
          ) === signature,
      );

      if (existing) {
        return prev.map((line) =>
          line.lineId === existing.lineId
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        );
      }

      return [
        ...prev,
        {
          lineId: createLineId(),
          itemId: item._id,
          name: item.name,
          basePrice: item.price,
          quantity,
          imageUrl: item.imageUrl ?? getMenuImageUrl(item.category, item.slug),
          category: item.category,
          slug: item.slug,
          description: item.description,
          sauceRequired: item.sauceRequired,
          customizationType: item.customizationType,
          ingredients: item.ingredients,
          selectedIngredients,
          selectedSauce,
          selectedExtras,
          specialInstructions,
        },
      ];
    });

    return true;
  }, []);

  const addDefaultItem = useCallback(
    (item: MenuItem): boolean => {
      if (requiresDetailBeforeAdd(item)) return false;
      return addItem(item, {
        quantity: 1,
        selectedIngredients: getDefaultIngredients(item),
        selectedExtras: [],
      });
    },
    [addItem],
  );

  const removeDefaultItem = useCallback((item: MenuItem) => {
    const defaultIngredients = getDefaultIngredients(item);
    const signature = configSignature(item._id, defaultIngredients, undefined, undefined, []);

    setLines((prev) => {
      const line = prev.find(
        (l) =>
          configSignature(
            l.itemId,
            l.selectedIngredients,
            l.specialInstructions,
            l.selectedSauce,
            l.selectedExtras,
          ) === signature,
      );
      if (!line) return prev;
      if (line.quantity <= 1) return prev.filter((l) => l.lineId !== line.lineId);
      return prev.map((l) =>
        l.lineId === line.lineId ? { ...l, quantity: l.quantity - 1 } : l,
      );
    });
  }, []);

  const decrementItem = useCallback((item: MenuItem) => {
    setLines((prev) => {
      const line = prev.find((l) => l.itemId === item._id);
      if (!line) return prev;
      if (line.quantity <= 1) return prev.filter((l) => l.lineId !== line.lineId);
      return prev.map((l) =>
        l.lineId === line.lineId ? { ...l, quantity: l.quantity - 1 } : l,
      );
    });
  }, []);

  const updateLineQuantity = useCallback((lineId: string, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) return prev.filter((line) => line.lineId !== lineId);
      return prev.map((line) =>
        line.lineId === lineId ? { ...line, quantity } : line,
      );
    });
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setLines((prev) => prev.filter((line) => line.lineId !== lineId));
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
    clearCartStorage();
  }, []);

  const getDefaultLineQuantity = useCallback(
    (item: MenuItem) => {
      const defaultIngredients = getDefaultIngredients(item);
      const signature = configSignature(item._id, defaultIngredients, undefined, undefined, []);
      const line = lines.find(
        (l) =>
          configSignature(
            l.itemId,
            l.selectedIngredients,
            l.specialInstructions,
            l.selectedSauce,
            l.selectedExtras,
          ) === signature,
      );
      return line?.quantity ?? 0;
    },
    [lines],
  );

  const getQuantityForItem = useCallback(
    (itemId: string) =>
      lines
        .filter((line) => line.itemId === itemId)
        .reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      itemCount: cartItemCount(lines),
      total: cartTotal(lines),
      hydrated,
      getQuantityForItem,
      getDefaultLineQuantity,
      addItem,
      addDefaultItem,
      removeDefaultItem,
      decrementItem,
      updateLineQuantity,
      removeLine,
      clearCart,
    }),
    [
      lines,
      hydrated,
      getQuantityForItem,
      getDefaultLineQuantity,
      addItem,
      addDefaultItem,
      removeDefaultItem,
      decrementItem,
      updateLineQuantity,
      removeLine,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
}
