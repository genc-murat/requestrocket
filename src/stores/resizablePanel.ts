import { writable } from 'svelte/store';

export const dividerPosition = writable(35);

let isDragging = false;
let startY: number;
let startHeight: number;

export function handleMouseDown(event: MouseEvent) {
  isDragging = true;
  startY = event.clientY;
  startHeight = document.querySelector('.request-section')?.clientHeight || 0;
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}

function handleMouseMove(event: MouseEvent) {
  if (!isDragging) return;
  const deltaY = event.clientY - startY;
  const newHeight = startHeight + deltaY;
  const containerHeight = document.querySelector('.combined-panel')?.clientHeight || 0;
  const newPosition = (newHeight / containerHeight) * 100;
  dividerPosition.set(Math.max(35, Math.min(85, newPosition)));
}

function handleMouseUp() {
  isDragging = false;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
}