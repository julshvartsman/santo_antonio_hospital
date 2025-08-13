import { useState, useEffect } from "react";
import { User, LoginCredentials, UseAuthReturn } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import {
  getFromStorage,
  setToStorage,
  removeFromStorage,
  assignHospitalToUser,
} from "@/lib/utils";

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

    // Fetch user profile with reduced timeout
    const profilePromise = supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    const timeoutPromise = new Promise(
      (_, reject) =>
        setTimeout(() => reject(new Error("Profile fetch timeout")), 3000) // Reduced from 5000ms
    );

    try {
      const { data: profile, error: profileError } = (await Promise.race([
        profilePromise,
        timeoutPromise,
      ])) as any;

      if (profileError) {
        console.log("Profile not found, creating new profile...");
        console.log("Profile error details:", profileError);
        console.log("Profile error code:", profileError?.code);
        console.log("Profile error message:", profileError?.message);
        console.log("User ID:", data.user.id);
        console.log("User email:", data.user.email);

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

        console.log("Creating profile with data:", newProfile);

        // Simple direct insert - no API calls
        const { data: createdProfile, error: createError } = await supabase
          .from("profiles")
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          console.error("Profile creation error:", createError);
          console.error("Create error code:", createError?.code);
          console.error("Create error message:", createError?.message);
          // If profile creation fails, return basic user info
          return {
            id: data.user.id,
            email: data.user.email!,
            name: newProfile.full_name,
            role: newProfile.role,
            hospital_id: null,
          } as User;
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
        const assigned = await assignHospitalToUser(
          profile.id,
          data.user.user_metadata.hospital
        );
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
              role: updatedProfile.role?.trim() || "department_head",
              hospital_id: updatedProfile.hospital_id,
            } as User;
          }
        }
      }

      return {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role?.trim() || "department_head",
        hospital_id: profile.hospital_id,
      } as User;
    } catch (error) {
      console.error("Login error:", error);
      // Return basic user info if everything fails
      return {
        id: data.user.id,
        email: data.user.email!,
        name:
          data.user.user_metadata?.full_name || data.user.email!.split("@")[0],
        role: data.user.user_metadata?.role || "department_head",
        hospital_id: null,
      } as User;
    }
  }

  static async signup(
    credentials: LoginCredentials & { name?: string }
  ): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.name || credentials.email.split("@")[0],
          role: "department_head",
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Signup failed");
    }

    // Create profile manually since trigger might not work
    const profileData = {
      id: data.user.id,
      email: data.user.email!,
      full_name: credentials.name || data.user.email!.split("@")[0],
      role: "department_head",
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .insert([profileData]);

    if (profileError) {
      console.error("Profile creation error during signup:", profileError);
      // Don't throw error, just log it
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      name: profileData.full_name,
      role: profileData.role,
      hospital_id: null,
    } as User;
  }

  static async logout(): Promise<void> {
    await supabase.auth.signOut();
    removeFromStorage("user");
    removeFromStorage("user_cache_time");
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

      // Check cache first for faster response
      const cachedUser = getFromStorage("user");
      if (cachedUser && cachedUser.id === session.user.id) {
        // Verify cache is still valid (not older than 5 minutes)
        const cacheTime = getFromStorage("user_cache_time");
        if (cacheTime && Date.now() - cacheTime < 5 * 60 * 1000) {
          return cachedUser;
        }
      }

      // Always fetch fresh data from database instead of using cache
      const profilePromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise(
        (_, reject) =>
          setTimeout(() => reject(new Error("Profile fetch timeout")), 3000) // Reduced from 5000ms
      );

      const { data: profile, error: profileError } = (await Promise.race([
        profilePromise,
        timeoutPromise,
      ])) as any;

      if (profileError) {
        console.error("Profile fetch error:", profileError);

        // Try to create profile if it doesn't exist
        try {
          const newProfile = {
            id: session.user.id,
            email: session.user.email!,
            full_name:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email!.split("@")[0],
            role: session.user.user_metadata?.role || "department_head",
          };

          const { data: createdProfile, error: createError } = await supabase
            .from("profiles")
            .insert([newProfile])
            .select()
            .single();

          if (!createError && createdProfile) {
            const user = {
              id: createdProfile.id,
              email: createdProfile.email,
              name: createdProfile.full_name,
              role: createdProfile.role,
              hospital_id: createdProfile.hospital_id,
            } as User;

            setToStorage("user", user);
            setToStorage("user_cache_time", Date.now());
            return user;
          }
        } catch (createError) {
          console.error("Failed to create profile:", createError);
        }

        // Return basic user info if profile fetch fails
        const basicUser = {
          id: session.user.id,
          email: session.user.email!,
          name:
            session.user.user_metadata?.full_name ||
            session.user.email!.split("@")[0],
          role: session.user.user_metadata?.role || "department_head",
          hospital_id: undefined,
        } as User;

        // Cache the basic user with timestamp
        setToStorage("user", basicUser);
        setToStorage("user_cache_time", Date.now());
        return basicUser;
      }

      const user = {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role,
        hospital_id: profile.hospital_id,
      } as User;

      // Cache the user with timestamp
      setToStorage("user", user);
      setToStorage("user_cache_time", Date.now());
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

  // Initialize auth state on mount with optimized loading
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      console.log("Initializing auth...");
      try {
        // Check for cached user first to show immediate feedback
        const cachedUser = getFromStorage("user");
        const cacheTime = getFromStorage("user_cache_time");

        if (
          cachedUser &&
          cacheTime &&
          Date.now() - cacheTime < 5 * 60 * 1000 &&
          isMounted
        ) {
          setUser(cachedUser);
          setIsLoading(false);
          return; // Use cached data, don't fetch fresh data immediately
        }

        // Only fetch fresh data if cache is invalid or doesn't exist
        const startTime = Date.now();
        const currentUser = await AuthService.getCurrentUser();
        const endTime = Date.now();
        console.log(`Auth initialization took ${endTime - startTime}ms`);

        if (isMounted) {
          setUser(currentUser);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        // Clear any invalid session data
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error("Failed to sign out during init:", signOutError);
        }
      }
    };

    // Reduced delay for faster initial load
    const timeoutId = setTimeout(initAuth, 50); // Reduced from 100ms

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Listen for auth changes from Supabase
  useEffect(() => {
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
        removeFromStorage("user_cache_time");
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
      setToStorage("user_cache_time", Date.now());
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
      setToStorage("user_cache_time", Date.now());
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
      removeFromStorage("user_cache_time");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear local state even if API call fails
      setUser(null);
      removeFromStorage("user");
      removeFromStorage("user_cache_time");
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
