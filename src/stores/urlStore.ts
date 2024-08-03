import { writable } from 'svelte/store';

export const url = writable('');
export const method = writable('GET');