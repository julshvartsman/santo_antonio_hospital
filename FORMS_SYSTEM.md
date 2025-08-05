# Forms System Documentation

## Overview

The forms system provides a dynamic, type-safe way to collect sustainability metrics from hospital departments. It includes:

- **Dynamic Form Generation**: Forms are created on-demand with validation
- **Real-time Data Persistence**: Data is saved to Supabase with real-time updates
- **Role-based Access**: Department users can only access their hospital's forms
- **Submission Tracking**: Forms can be saved as drafts or submitted

## Database Schema

### Forms Table

```sql
CREATE TABLE forms (
  id TEXT PRIMARY KEY,             -- Format: '${hospitalId}-${MM}-${YYYY}'
  hospital_id UUID REFERENCES hospitals(id),
  month INT,
  year INT,
  data JSONB,                      -- map of metricKey → numeric value
  submitted BOOL DEFAULT FALSE,
  submitted_at TIMESTAMP
);
```

### Form ID Format

Form IDs follow the pattern: `{hospitalId}-{MM}-{YYYY}`

Examples:

- `abc123-07-2025` (Hospital abc123, July 2025)
- `def456-12-2024` (Hospital def456, December 2024)

## Components

### 1. DynamicForm Component

Located at `components/forms/DynamicForm.tsx`

**Features:**

- Renders sustainability metrics with validation
- Supports save draft and submit functionality
- Shows submission status
- Responsive grid layout

**Props:**

```typescript
interface DynamicFormProps {
  formId: string;
  hospitalId: string;
  month: number;
  year: number;
  initialData?: Record<string, number>;
  onSubmit?: (data: Record<string, number>) => void;
  onSave?: (data: Record<string, number>) => void;
  isSubmitted?: boolean;
  loading?: boolean;
  saving?: boolean;
}
```

### 2. Form Metrics

The system includes 8 sustainability metrics:

1. **Energy Usage** (kWh) - Required
2. **Water Usage** (m³) - Required
3. **Waste Generated** (kg) - Required
4. **Recycling Rate** (%) - Required
5. **CO2 Emissions** (kg CO2e) - Required
6. **Renewable Energy Usage** (kWh) - Optional
7. **Paper Usage** (kg) - Optional
8. **Chemical Usage** (L) - Optional

## Hooks

### useMyFormList()

Fetches the current user's forms for the last 12 months.

**Returns:**

```typescript
{
  forms: FormListEntry[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}
```

### useFormById(formId: string)

Fetches or creates a single form by ID.

**Returns:**

```typescript
{
  form: Form | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveForm: (data: Record<string, number>) => Promise<void>;
  submitForm: (data: Record<string, number>) => Promise<void>;
  refresh: () => void;
}
```

## Pages

### 1. Department Dashboard (`/department/dashboard`)

**Features:**

- Big "Submit This Month's Data" button
- Collapsible form slot
- Current month form integration
- Submission status display

### 2. Forms Listing (`/department/data-entry`)

**Features:**

- Table of past 12 months of forms
- Status badges (Submitted/Draft)
- View/Edit buttons
- Summary statistics

### 3. Dynamic Form Page (`/department/data-entry/[id]`)

**Features:**

- Dynamic routing based on form ID
- Form validation and submission
- Real-time data persistence
- Error handling

## Usage Examples

### Creating a Form

```typescript
const { form, saveForm, submitForm } = useFormById("abc123-07-2025");

// Save as draft
await saveForm({
  energy_usage: 1500,
  water_usage: 200,
  waste_generated: 500,
  recycling_rate: 75,
  co2_emissions: 1200,
});

// Submit form
await submitForm({
  energy_usage: 1500,
  water_usage: 200,
  waste_generated: 500,
  recycling_rate: 75,
  co2_emissions: 1200,
});
```

### Listing Forms

```typescript
const { forms, loading } = useMyFormList();

// Forms will include all 12 months, with actual data for existing forms
forms.map((form) => ({
  id: form.id,
  name: form.form_name, // "July 2025"
  status: form.submitted ? "Submitted" : "Draft",
  submittedAt: form.submitted_at,
}));
```

## Security

### Row Level Security (RLS)

- **Department Users**: Can only access forms for their hospital
- **Admins**: Can view all forms across all hospitals
- **Form Creation**: Automatically creates forms with proper hospital association

### Policies

```sql
-- Users can manage their hospital's forms
CREATE POLICY "Users can manage their hospital's forms" ON forms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.hospital_id = forms.hospital_id
    )
  );

-- Admins can view all forms
CREATE POLICY "Admins can view all forms" ON forms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

## Error Handling

The system includes comprehensive error handling:

- **Invalid Form IDs**: Validates format and provides user feedback
- **Database Errors**: Graceful fallbacks with retry options
- **Validation Errors**: Real-time form validation with clear messages
- **Network Issues**: Loading states and error recovery

## Performance

- **Indexed Queries**: Database indexes on hospital_id, month, year
- **Lazy Loading**: Forms are created on-demand
- **Caching**: Form data is cached in component state
- **Optimistic Updates**: UI updates immediately, syncs with database

## Future Enhancements

1. **Form Templates**: Customizable form fields per hospital
2. **Bulk Operations**: Submit multiple months at once
3. **Data Export**: Export form data to CSV/Excel
4. **Audit Trail**: Track all form changes
5. **Notifications**: Email reminders for pending submissions
