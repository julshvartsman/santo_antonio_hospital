import { useState, useEffect } from "react";
import { User, LoginCredentials, UseAuthReturn } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { getFromStorage, setToStorage, removeFromStorage, assignHospitalToUser } from "@/lib/utils";

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

    // Fetch user profile from your profiles table with timeout
    const profilePromise = supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
    );

    try {
      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      if (profileError) {
        // If profile doesn't exist, create one
        const newProfile = {
          id: data.user.id,
          email: data.user.email!,
          full_name:
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            data.user.email!.split("@")[0],
          role: data.user.user_metadata?.role || "department_head",
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
          hospital_id: createdProfile.hospital_id,
        } as User;
      }

      // If user doesn't have hospital_id but has hospital info in metadata, assign it
      if (!profile.hospital_id && data.user.user_metadata?.hospital) {
        const assigned = await assignHospitalToUser(profile.id, data.user.user_metadata.hospital);
        if (assigned) {
          // Fetch updated profile
          const { data: updatedProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();
          
          if (updatedProfile) {
            return {
              id: updatedProfile.id,
              email: updatedProfile.email,
              name: updatedProfile.full_name,
              role: updatedProfile.role,
              hospital_id: updatedProfile.hospital_id,
            } as User;
          }
        }
      }

      return {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role,
        hospital_id: profile.hospital_id,
      } as User;
    } catch (error) {
      console.error("Profile fetch error:", error);
      // Return basic user info if profile fetch fails
      return {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.full_name || data.user.email!.split("@")[0],
        role: data.user.user_metadata?.role || "department_head",
        hospital_id: undefined,
      } as User;
    }
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
      console.error("Logout error:", error);
      // Don't throw error, just log it
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error);
        // Clear any invalid session data
        await supabase.auth.signOut();
        return null;
      }

      if (!session?.user) {
        return null;
      }

      console.log("=== DEBUG: getCurrentUser ===");
      console.log("Session user ID:", session.user.id);
      console.log("Session user email:", session.user.email);

      // Always fetch fresh data from database instead of using cache
      console.log("Fetching fresh profile data...");
      const profilePromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );

      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      console.log("=== DEBUG: Profile fetch ===");
      console.log("Session user ID:", session.user.id);
      console.log("Profile data:", profile);
      console.log("Profile error:", profileError);
      console.log("===========================");

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        // Return basic user info if profile fetch fails
        const basicUser = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || session.user.email!.split("@")[0],
          role: session.user.user_metadata?.role || "department_head",
          hospital_id: undefined,
        } as User;
        
        // Cache the basic user
        setToStorage("user", basicUser);
        return basicUser;
      }

      const user = {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role,
        hospital_id: profile.hospital_id,
      } as User;

      console.log("=== DEBUG: Constructed user object ===");
      console.log("User object:", user);
      console.log("User hospital_id:", user.hospital_id);
      console.log("================================");

      // Cache the user
      setToStorage("user", user);
      return user;
    } catch (error) {
      console.error("getCurrentUser error:", error);
      return null;
    }
  }
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      console.log("Initializing auth...");
      try {
        // Always fetch fresh data from server instead of using cache
        const startTime = Date.now();
        const currentUser = await AuthService.getCurrentUser();
        const endTime = Date.now();
        console.log(`Auth initialization took ${endTime - startTime}ms`);
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        setUser(null);
        // Clear any invalid session data
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error("Failed to sign out during init:", signOutError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes from Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);

      if (event === "SIGNED_IN" && session?.user) {
        try {
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error("Error getting user after sign in:", error);
          setUser(null);
        }
      } else if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
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
