/**
 * Offline Complaint Queue
 * Stores pending complaints in IndexedDB when the network is unavailable.
 * Uses the `idb` library for a promise-based wrapper.
 */
import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'civicmind-offline'
const STORE_NAME = 'pending-complaints'
const DB_VERSION = 1

export interface PendingComplaint {
  idempotencyKey: string          // uuid — used for dedup on server
  imageBase64: string | null
  lat: number | null
  lng: number | null
  wardId: string | null
  formData: {
    title?: string
    description?: string
    category?: string
  }
  createdAt: string
  retries: number
}

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'idempotencyKey' })
      }
    },
  })
}

export async function enqueueComplaint(payload: Omit<PendingComplaint, 'retries'>): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, { ...payload, retries: 0 })
}

export async function getPendingComplaints(): Promise<PendingComplaint[]> {
  const db = await getDB()
  return db.getAll(STORE_NAME)
}

export async function removeComplaint(idempotencyKey: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, idempotencyKey)
}

export async function incrementRetry(idempotencyKey: string): Promise<void> {
  const db = await getDB()
  const item = await db.get(STORE_NAME, idempotencyKey)
  if (item) {
    await db.put(STORE_NAME, { ...item, retries: item.retries + 1 })
  }
}

export async function getPendingCount(): Promise<number> {
  const db = await getDB()
  return db.count(STORE_NAME)
}
