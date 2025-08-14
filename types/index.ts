// Authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "department_head" | "super_admin";
  avatar?: string;
  hospital_id?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Language types
export type Language = "en" | "pt";

// Sustainability data types
export interface SustainabilityMetric {
  id: string;
  category: string;
  subcategory: string;
  metric: string;
  unit: string;
  value: number | null;
  target?: number;
  isLocked: boolean;
  lockedBy?: User;
  lockedAt?: Date;
  lastUpdated: Date;
  updatedBy: User;
}

export interface MonthlyReport {
  id: string;
  month: number;
  year: number;
  metrics: SustainabilityMetric[];
  isCompleted: boolean;
  dueDate: Date;
  submittedAt?: Date;
  submittedBy?: User;
}

// Notification types
export interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

// Analytics types
export interface CO2Calculation {
  category: string;
  emissions: number;
  unit: string;
  trend: "up" | "down" | "stable";
  percentage: number;
}

export interface AnalyticsDashboard {
  totalEmissions: number;
  monthlyTrend: number;
  categories: CO2Calculation[];
  lastUpdated: Date;
}

// Chat/Support types
export interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export interface FAQItem {
  id: string;
  question: string;
  question_pt?: string;
  answer: string;
  answer_pt?: string;
  category: string;
  category_pt?: string;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "email" | "password" | "select" | "checkbox";
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Table types
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  editable?: boolean;
  type?: "text" | "number" | "date" | "select";
  width?: string;
}

export interface TableAction {
  label: string;
  icon?: React.ComponentType;
  onClick: (row: any) => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: (row: any) => boolean;
}

// Component props types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export interface AlertProps {
  type: "info" | "warning" | "error" | "success";
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

// Hook types
export interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  signup: (credentials: LoginCredentials & { name?: string }) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface UseLanguageReturn {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}
