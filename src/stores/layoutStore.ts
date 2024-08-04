import { writable } from 'svelte/store';

const storedLayout = localStorage.getItem("preferredLayout") || 'default';

export const currentLayout = writable(storedLayout);

currentLayout.subscribe(value => {
    localStorage.setItem("preferredLayout", value);
});