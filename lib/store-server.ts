/** Server-safe unique id (the one in store.tsx lives in a "use client" module). */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
