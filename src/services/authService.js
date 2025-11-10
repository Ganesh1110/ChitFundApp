import api from "./api";
import StorageService from "./storageService";

class AuthService {
  // Register new user
  async register(userData) {
    try {
      const response = await api.post("/auth/register", userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await api.post("/auth/login", credentials);

      if (response.data.token) {
        await StorageService.saveToken(response.data.token);
        await StorageService.saveUserData(response.data.user);
        await StorageService.setLoginStatus(true);
      }

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  }

  // Send OTP
  async sendOTP(mobile) {
    try {
      const response = await api.post("/auth/send-otp", { mobile });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to send OTP",
      };
    }
  }

  // Verify OTP
  async verifyOTP(mobile, otp) {
    try {
      const response = await api.post("/auth/verify-otp", { mobile, otp });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Invalid OTP",
      };
    }
  }

  // Upload KYC documents
  async uploadKYC(formData) {
    try {
      const response = await api.post("/auth/kyc-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "KYC upload failed",
      };
    }
  }

  // Logout
  async logout() {
    try {
      await api.post("/auth/logout");
      await StorageService.clearAll();
      return { success: true };
    } catch (error) {
      await StorageService.clearAll();
      return { success: true };
    }
  }
}

export default new AuthService();
