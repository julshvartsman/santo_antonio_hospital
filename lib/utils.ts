import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabaseClient";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date utilities
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getDaysUntil(date: Date): number {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isOverdue(date: Date): boolean {
  return getDaysUntil(date) < 0;
}

// Number utilities
export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatPercentage(num: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(num / 100);
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Local storage utilities
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error writing to localStorage:", error);
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
}

// Mock data generators
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Hospital mapping utilities - now dynamic
export type HospitalName = string;

// Function to get hospital slug from name (for routing/URLs)
export function getHospitalSlug(hospitalName: string): string {
  return hospitalName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Function to get hospital ID by name
export async function getHospitalIdByName(hospitalName: string): Promise<string | null> {
  try {
    // First try exact match
    const { data: hospital, error } = await supabase
      .from('hospitals')
      .select('id, name')
      .eq('name', hospitalName)
      .single();
    
    if (!error && hospital) {
      return hospital.id;
    }
    
    // If exact match fails, try partial match
    const { data: partialMatch, error: partialError } = await supabase
      .from('hospitals')
      .select('id, name')
      .ilike('name', `%${hospitalName}%`)
      .single();
    
    if (!partialError && partialMatch) {
      console.log(`Found hospital by partial match: "${partialMatch.name}" for "${hospitalName}"`);
      return partialMatch.id;
    }
    
    console.error('Hospital not found:', hospitalName);
    return null;
  } catch (err) {
    console.error('Error fetching hospital:', err);
    return null;
  }
}

// Function to assign hospital to user profile
export async function assignHospitalToUser(userId: string, hospitalName: string): Promise<boolean> {
  try {
    const hospitalId = await getHospitalIdByName(hospitalName);
    
    if (!hospitalId) {
      console.error('Hospital not found:', hospitalName);
      return false;
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({ hospital_id: hospitalId })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user hospital:', error);
      return false;
    }
    
    console.log(`Successfully assigned hospital "${hospitalName}" (ID: ${hospitalId}) to user ${userId}`);
    return true;
  } catch (err) {
    console.error('Error in assignHospitalToUser:', err);
    return false;
  }
}
