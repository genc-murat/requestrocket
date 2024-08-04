
import { writable } from 'svelte/store';

export const showModal = writable(false);
export const itemToDelete = writable<number | null>(null);
export const variablesPanelOpen = writable(false);
export const groupModalOpen = writable(true);
export const themeModalOpen = writable(false);
export const apiFlowModalOpen = writable(false);
export const showDiffView = writable(false);