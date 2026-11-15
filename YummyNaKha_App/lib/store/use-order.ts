import { dishRequestOptions, type DishRequest } from "../staff-phrases";
import type { Dish } from "../types";
import { useAppState, useDishes } from "./app-store";

export interface OrderItem extends Dish {
  quantity: number;
  /** The requests picked for this dish, in the order they're offered. */
  requests: DishRequest[];
}

/** Dishes the user selected (in selection order), with quantities, requests and the total. */
export function useOrder() {
  const dishes = useDishes();
  const { selectedIds, quantities, dishRequests, profile } = useAppState();
  const options = dishRequestOptions(profile);
  const items: OrderItem[] = selectedIds.flatMap((id) => {
    const dish = dishes?.find((d) => d.id === id);
    if (!dish) return [];
    const picked = dishRequests[id] ?? [];
    return [{ ...dish, quantity: quantities[id] ?? 1, requests: options.filter((o) => picked.includes(o.id)) }];
  });
  const total = items.reduce((sum, d) => sum + (d.price ?? 0) * d.quantity, 0);
  const count = items.reduce((sum, d) => sum + d.quantity, 0);
  return { items, total, count, options };
}
