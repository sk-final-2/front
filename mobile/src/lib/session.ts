// mobile/src/lib/session.ts
export type Profile = { email: string; name: string; role?: string } | null;

let _profile: Profile = null;

export function setProfile(p: Profile) {
  _profile = p;
}
export function getProfile(): Profile {
  return _profile;
}
