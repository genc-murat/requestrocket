import { writable } from 'svelte/store';

export const urlAutocomplete = writable<string[]>([]);
export const headerAutocomplete = writable<string[]>([]);
export const queryParamAutocomplete = writable<string[]>([]);