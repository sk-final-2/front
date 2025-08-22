// src/lib/resultCache.ts
let _map = new Map<string, any>();
let _last: any | null = null;

export function saveResult(id: string, data: any) {
  _map.set(id, data);
  _last = data;
}
export function getResult(id?: string) {
  if (id && _map.has(id)) return _map.get(id);
  return _last;
}
export function clearResults() {
  _map.clear();
  _last = null;
}
