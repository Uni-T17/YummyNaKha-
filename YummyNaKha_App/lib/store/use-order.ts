import { useAppState, useDishes } from "./app-store";

/** Dishes the user selected (in selection order) and their total. */
export function useOrder() {
  const dishes = useDishes();
  const { selectedIds } = useAppState();
  const items = selectedIds
    .map((id) => dishes?.find((d) => d.id === id))
    .filter((d): d is NonNullable<typeof d> => d !== undefined);
  const total = items.reduce((sum, d) => sum + (d.price ?? 0), 0);
  return { items, total };
}
