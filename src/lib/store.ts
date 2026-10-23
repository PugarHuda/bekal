// This device's keys and records, in IndexedDB. Nothing is sent anywhere: a centre's key, a learner's wallet key and
// the records live only in the browser that made or received them (and in a backup file the learner chooses to keep).
const DB = "bekal", STORE = "kv"

function db(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const r = indexedDB.open(DB, 1)
        r.onupgradeneeded = () => r.result.createObjectStore(STORE)
        r.onsuccess = () => resolve(r.result)
        r.onerror = () => reject(r.error)
    })
}
async function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const d = await db()
    return new Promise((resolve, reject) => {
        const req = run(d.transaction(STORE, mode).objectStore(STORE))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}
export const get = <T>(key: string) => tx<T | undefined>("readonly", (s) => s.get(key) as IDBRequest<T | undefined>)
export const set = (key: string, value: unknown) => tx("readwrite", (s) => s.put(value, key))

/** A key kept under `name`, made on first use. */
export async function keyFor(name: string, make: () => string): Promise<string> {
    const k = await get<string>(name)
    if (k) return k
    const fresh = make()
    await set(name, fresh)
    return fresh
}
