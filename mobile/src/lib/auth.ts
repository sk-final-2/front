import * as SecureStore from 'expo-secure-store';

let _accessToken: string | null = null;

export async function saveTokens(access: string, refresh: string) {
  _accessToken = access;
  await SecureStore.setItemAsync('refreshToken', refresh);
}

export function getAccessToken() {
  return _accessToken;
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync('refreshToken');
}

export async function clearTokens() {
  _accessToken = null;
  await SecureStore.deleteItemAsync('refreshToken');
}
