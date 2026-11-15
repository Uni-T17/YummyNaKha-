import { useEffect, useState } from "react";
import { loadPhoto } from "../photo-cache";
import { useAppState } from "./app-store";

/**
 * The scanned menu photos in page order, for the Menu screen: the picked
 * file while it's still in memory, else the copy kept in this browser (after
 * a reload). undefined for a photo we no longer have.
 */
export function useMenuPhotos(): (string | undefined)[] {
  const { menuImageIds, uploads } = useAppState();
  const [restored, setRestored] = useState<Record<string, string>>({});
  const key = menuImageIds.join(",");

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    const urls: string[] = [];
    Promise.all(
      key.split(",").map(async (id) => {
        const blob = await loadPhoto(id);
        if (!blob) return null;
        const url = URL.createObjectURL(blob);
        urls.push(url);
        return [id, url] as const;
      }),
    ).then((pairs) => {
      if (!cancelled) setRestored(Object.fromEntries(pairs.filter((p) => p !== null)));
    });
    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [key]);

  return menuImageIds.map((id) => uploads.find((u) => u.id === id)?.previewUrl ?? restored[id]);
}
