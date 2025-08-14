export interface Form {
  id: string; // Format: '${hospitalId}-${MM}-${YYYY}'
  hospital_id: string;
  month: number;
  year: number;
  data: Record<string, number | string>; // map of metricKey → value
  submitted: boolean;
  submitted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FormListEntry {
  id: string;
  month: number;
  year: number;
  submitted: boolean;
  submitted_at?: string | null;
  form_name: string; // "Month Year" format
}

export interface FormMetric {
  key: string;
  label: string;
  unit: string;
  type: "number" | "percentage" | "currency" | "text" | "select";
  required?: boolean;
  min?: number;
  max?: number;
  description?: string;
  options?: { value: string; label: string }[]; // for select
}

export interface DynamicFormProps {
  formId: string;
  hospitalId: string;
  month: number;
  year: number;
  onSubmit?: (data: Record<string, number>) => void;
  onSave?: (data: Record<string, number>) => void;
}
