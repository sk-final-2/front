// mobile/src/lib/historyCache.ts
import type { Interview } from './api';

const map = new Map<string, Interview>();

export function cacheInterviews(list: Interview[]) {
  list.forEach(i => map.set(i.uuid, i));
}
export function getInterview(uuid: string) {
  return map.get(uuid) || null;
}
