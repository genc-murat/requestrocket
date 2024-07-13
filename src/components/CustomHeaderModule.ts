import { writable } from 'svelte/store';

export interface CustomHeader {
  id: number;
  name: string;
}

export const customHeaders = writable<CustomHeader[]>([]);
export const newCustomHeaderName = writable('');
export const customHeaderPanelOpen = writable(false);

let db: any;

export function setDatabase(database: any) {
  db = database;
}

export async function loadCustomHeaders() {
  try {
    if (!db) {
      console.error('Database not initialized');
      return;
    }
    const headers = await db.getAll('customHeaders');
    customHeaders.set(headers);
  } catch (error) {
    console.error('Failed to load custom headers:', error);
  }
}

export async function addCustomHeader(name: string) {
  try {
    if (!db) {
      console.error('Database not initialized');
      return;
    }
    const id = await db.add('customHeaders', { name });
    customHeaders.update(headers => [...headers, { id: id as number, name }]);
  } catch (error) {
    console.error('Failed to add custom header:', error);
  }
}

export async function deleteCustomHeader(id: number) {
  try {
    if (!db) {
      console.error('Database not initialized');
      return;
    }
    await db.delete('customHeaders', id);
    customHeaders.update(headers => headers.filter(h => h.id !== id));
  } catch (error) {
    console.error('Failed to delete custom header:', error);
  }
}

export function openCustomHeaderPanel() {
  customHeaderPanelOpen.set(true);
}

export function closeCustomHeaderPanel() {
  customHeaderPanelOpen.set(false);
}