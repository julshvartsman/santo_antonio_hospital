import { useState, useEffect } from "react";
import { User, LoginCredentials, UseAuthReturn } from "@/types";
import {
  getFromStorage,
  setToStorage,
  removeFromStorage,
  sleep,
} from "@/lib/utils";

// Mock user data
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@cityx-hospital.com",
    name: "Admin User",
    role: "admin",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "2",
    email: "user@cityx-hospital.com",
    name: "Regular User",
    role: "user",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
  },
];

// Mock authentication service
class AuthService {
  static async login(credentials: LoginCredentials): Promise<User> {
    // Simulate API call
    await sleep(1000);

    const user = mockUsers.find((u) => u.email === credentials.email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // In a real app, you'd verify the password hash
    if (credentials.password !== "password123") {
      throw new Error("Invalid email or password");
    }

    return user;
  }

  static async logout(): Promise<void> {
    // Simulate API call
    await sleep(500);
  }

  static async getCurrentUser(): Promise<User | null> {
    const userData = getFromStorage<User | null>("user", null);

    if (!userData) {
      return null;
    }

    // In a real app, you'd verify the session token
    return userData;
  }
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        removeFromStorage("user");

        // Auto-authenticate with admin user for development
        const defaultUser = mockUsers[0]; // Admin user
        setUser(defaultUser);
        setToStorage("user", defaultUser);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const loggedInUser = await AuthService.login(credentials);
      setUser(loggedInUser);
      setToStorage("user", loggedInUser);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      removeFromStorage("user");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear local state even if API call fails
      setUser(null);
      removeFromStorage("user");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
