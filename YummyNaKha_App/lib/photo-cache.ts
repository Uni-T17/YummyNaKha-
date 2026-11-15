// Keeps the diner's menu photos in this browser (IndexedDB) so the Menu screen
// can show them — and mark a dish on them — after a page reload. Our server
// deletes its copy once the text is read (LR5); this copy never leaves the
// device and is cleared when the photo is removed or the diner signs out.
// Every call fails quietly: without storage the photo just isn't shown.

const DB_NAME = "yummynakha-photos";
const STORE = "photos";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  try {
    const db = await open();
    return await new Promise<T>((resolve, reject) => {
      const request = action(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }).finally(() => db.close());
  } catch {
    return undefined;
  }
}

export const savePhoto = (id: string, photo: Blob) => run("readwrite", (s) => s.put(photo, id));
export const loadPhoto = (id: string) => run<Blob | undefined>("readonly", (s) => s.get(id));
export const deletePhoto = (id: string) => run("readwrite", (s) => s.delete(id));
export const clearPhotos = () => run("readwrite", (s) => s.clear());
