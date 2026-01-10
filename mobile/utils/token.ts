import * as SecureStore from "expo-secure-store";

export const saveTokens = async (access: string, refresh: string) => {
  await SecureStore.setItemAsync("access", access);
  await SecureStore.setItemAsync("refresh", refresh);
};

export const getAccessToken = () => SecureStore.getItemAsync("access");
export const getRefreshToken = () => SecureStore.getItemAsync("refresh");

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync("access");
  await SecureStore.deleteItemAsync("refresh");
};
