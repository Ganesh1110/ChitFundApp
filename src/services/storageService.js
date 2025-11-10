import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../utils/constants";

class StorageService {
  // Save user token
  async saveToken(token) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      return true;
    } catch (error) {
      console.error("Error saving token:", error);
      return false;
    }
  }

  // Get user token
  async getToken() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  // Save user data
  async saveUserData(userData) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(userData)
      );
      return true;
    } catch (error) {
      console.error("Error saving user data:", error);
      return false;
    }
  }

  // Get user data
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  // Set login status
  async setLoginStatus(status) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.IS_LOGGED_IN,
        JSON.stringify(status)
      );
      return true;
    } catch (error) {
      console.error("Error setting login status:", error);
      return false;
    }
  }

  // Check if user is logged in
  async isLoggedIn() {
    try {
      const status = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
      return status ? JSON.parse(status) : false;
    } catch (error) {
      console.error("Error checking login status:", error);
      return false;
    }
  }

  // Clear all data (logout)
  async clearAll() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.IS_LOGGED_IN,
      ]);
      return true;
    } catch (error) {
      console.error("Error clearing storage:", error);
      return false;
    }
  }
}

export default new StorageService();
