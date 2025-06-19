import { defineStore } from "pinia";
import { loginUser, getUserById, updateUserProfile, registerUser as apiRegisterUser } from "@/services/auth";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    lastActivity: null
  }),
  getters: {
    userName: (state) => (state.user ? state.user.name : ""),
    userEmail: (state) => (state.user ? state.user.email : ""),
    userAvatar: (state) =>
      state.user?.avatar ||
      "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/055f91bf-3af0-40ea-aa08-9703c4b5f150.png",
    isSessionExpired: (state) => {
      if (!state.lastActivity) return false;
      const now = new Date().getTime();
      const lastActivity = new Date(state.lastActivity).getTime();
      // Session expires after 24 hours of inactivity
      return now - lastActivity > 24 * 60 * 60 * 1000;
    }
  },
  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const user = await loginUser({ email, password });
        if (!user || !user.id) {
          throw new Error('Invalid user data received');
        }
        this.user = user;
        this.isAuthenticated = true;
        this.lastActivity = new Date().toISOString();
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("lastActivity", this.lastActivity);
        return user;
      } catch (error) {
        this.error = error.message || "Failed to login";
        this.isAuthenticated = false;
        this.user = null;
        this.lastActivity = null;
        localStorage.removeItem("user");
        localStorage.removeItem("lastActivity");
        throw error;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.user = null;
      this.isAuthenticated = false;
      this.lastActivity = null;
      localStorage.removeItem("user");
      localStorage.removeItem("lastActivity");
    },
    loadStoredUser() {
      const userData = localStorage.getItem("user");
      const lastActivity = localStorage.getItem("lastActivity");
      
      if (userData && lastActivity) {
        try {
          const parsedUser = JSON.parse(userData);
          const lastActivityDate = new Date(lastActivity);
          const now = new Date();
          
          // Check if session is expired
          if (now - lastActivityDate > 24 * 60 * 60 * 1000) {
            this.logout();
            return;
          }
          
          this.user = parsedUser;
          this.isAuthenticated = true;
          this.lastActivity = lastActivity;
          // Refresh user data from server
          this.fetchUserDetails();
        } catch (error) {
          console.error('Error loading stored user:', error);
          this.logout();
        }
      }
    },
    updateLastActivity() {
      this.lastActivity = new Date().toISOString();
      localStorage.setItem("lastActivity", this.lastActivity);
    },
    async fetchUserDetails() {
      if (!this.user?.id) return;
      try {
        const details = await getUserById(this.user.id);
        if (!details || !details.id) {
          throw new Error('Invalid user details received');
        }
        this.user = details;
        localStorage.setItem("user", JSON.stringify(details));
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        // Don't throw error here to prevent breaking the app
        // Just log it and continue with existing user data
      }
    },
    async updateProfile(updates) {
      if (!this.user?.id) return;
      try {
        const updatedUser = await updateUserProfile(this.user.id, updates);
        if (!updatedUser || !updatedUser.id) {
          throw new Error('Invalid user data received');
        }
        this.user = updatedUser;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      } catch (error) {
        console.error("Failed to update profile:", error);
        throw error;
      }
    },
    async registerUser({ name, email, password }) {
      this.loading = true;
      this.error = null;
      try {
        const user = await apiRegisterUser({ name, email, password });
        return user;
      } catch (error) {
        this.error = error.message || "Failed to register";
        throw error;
      } finally {
        this.loading = false;
      }
    }
  },
});
