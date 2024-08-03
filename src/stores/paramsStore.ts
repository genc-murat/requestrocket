import { writable } from 'svelte/store';
import type { Header, Param } from '../components/api-types';

export const headers = writable<Header[]>([]);
export const queryParams = writable<Param[]>([]);
export const pathParams = writable<Param[]>([]);
export const formParams = writable<Param[]>([]);