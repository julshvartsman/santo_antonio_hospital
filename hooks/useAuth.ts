import { useState, useEffect } from "react";
import { User, LoginCredentials, UseAuthReturn } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { getFromStorage, setToStorage, removeFromStorage } from "@/lib/utils";

// Authentication service using Supabase
class AuthService {
  static async login(credentials: LoginCredentials): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Login failed");
    }

    // Fetch user profile from your profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      // If profile doesn't exist, create one
      const newProfile = {
        id: data.user.id,
        email: data.user.email!,
        full_name:
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          data.user.email!.split("@")[0],
        role: data.user.user_metadata?.role || "user",
      };

      const { data: createdProfile, error: createError } = await supabase
        .from("profiles")
        .insert([newProfile])
        .select()
        .single();

      if (createError) {
        throw new Error("Failed to create user profile");
      }

      return {
        id: createdProfile.id,
        email: createdProfile.email,
        name: createdProfile.full_name,
        role: createdProfile.role,
      } as User;
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.full_name,
      role: profile.role,
    } as User;
  }

  static async signup(
    credentials: LoginCredentials & { name?: string }
  ): Promise<User> {
    console.log("Starting signup process for:", credentials.email);

    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.name || credentials.email.split("@")[0],
          role: "user",
        },
      },
    });

    if (error) {
      console.error("Supabase auth signup error:", error);
      throw new Error(`Authentication error: ${error.message}`);
    }

    if (!data.user) {
      console.error("No user returned from signup");
      throw new Error("Signup failed: No user returned");
    }

    console.log("User created successfully:", data.user.id);

    // SIMPLE APPROACH: Just return a basic user object without database profile
    // We'll create the profile later if needed
    const basicUser: User = {
      id: data.user.id,
      email: data.user.email!,
      name: credentials.name || data.user.email!.split("@")[0],
      role: "user",
    };

    console.log("Returning basic user without database profile:", basicUser);
    return basicUser;
  }

  static async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return null;
    }

    // Fetch user profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error) {
      return null;
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.full_name,
      role: profile.role,
    } as User;
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
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes from Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        removeFromStorage("user");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const loggedInUser = await AuthService.login(credentials);
      setUser(loggedInUser);
      setToStorage("user", loggedInUser);
      return loggedInUser;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    credentials: LoginCredentials & { name?: string }
  ): Promise<User> => {
    setIsLoading(true);
    try {
      const newUser = await AuthService.signup(credentials);
      setUser(newUser);
      setToStorage("user", newUser);
      return newUser;
    } catch (error) {
      console.error("Signup error:", error);
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
    signup,
    logout,
    isAuthenticated: !!user,
  };
}
