import { cartItemCount, cartTotal } from "@/lib/cart-utils";
import type { CartLineItem, MenuCategory, MenuItem } from "@/lib/types";

export function cartAnalyticsSnapshot(lines: CartLineItem[]) {
  return {
    cart_value: cartTotal(lines),
    cart_items: cartItemCount(lines),
  };
}

export function productAnalyticsProps(item: Pick<MenuItem, "_id" | "name" | "category" | "price">) {
  return {
    product_id: item._id,
    product_name: item.name,
    category: item.category as MenuCategory,
    price: item.price,
  };
}
