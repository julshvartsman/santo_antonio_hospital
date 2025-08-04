// Base types from database schema
export interface Hospital {
  id: string;
  name: string;
  location: string;
  created_at: string;
}

export interface Entry {
  id: string;
  user_id: string;
  hospital_id: string;
  month_year: string; // ISO date string YYYY-MM-DD
  kwh_usage: number;
  water_usage_m3: number;
  co2_emissions: number;
  submitted: boolean;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: "user" | "department_head" | "admin";
  hospital_id?: string;
  created_at: string;
  updated_at: string;
}

// Department Dashboard Types
export interface DepartmentDashboardData {
  hospital: Hospital;
  currentMonthEntry?: Entry;
  historicalEntries: Entry[];
  teamMembers: Profile[];
  monthlyTargets: {
    kwh_target: number;
    water_target: number;
    co2_target: number;
  };
}

// Admin Dashboard Types
export interface AdminDashboardData {
  hospitals: Hospital[];
  allEntries: Entry[];
  submissionStatus: {
    hospitalId: string;
    hospitalName: string;
    hasSubmittedThisMonth: boolean;
    lastSubmissionDate?: string;
  }[];
  systemMetrics: {
    totalHospitals: number;
    hospitalsSubmittedThisMonth: number;
    averageKwhUsage: number;
    averageWaterUsage: number;
    averageCo2Emissions: number;
  };
}

// Component Props Types
export interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  target?: number;
  trend?: number; // percentage change
  isLoading?: boolean;
}

export interface TrendChartProps {
  data: Entry[];
  metric: "kwh_usage" | "water_usage_m3" | "co2_emissions";
  title: string;
  unit: string;
  isLoading?: boolean;
}

export interface EntryFormProps {
  initialData?: Entry;
  onSubmit: (data: Partial<Entry>) => Promise<void>;
  onSaveDraft: (data: Partial<Entry>) => Promise<void>;
  isLoading?: boolean;
}

export interface HospitalStatusGridProps {
  hospitals: {
    id: string;
    name: string;
    status: "submitted" | "draft" | "missing";
    lastSubmission?: string;
  }[];
  isLoading?: boolean;
}

export interface SubmissionTrackerProps {
  dueDate: string;
  submittedHospitals: number;
  totalHospitals: number;
  isLoading?: boolean;
}
