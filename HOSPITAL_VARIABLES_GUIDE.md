# Hospital Variables System Guide

## Overview

The Hospital Variables system allows administrators to configure custom variables for each hospital. These variables can be used in forms, calculations, and displays throughout the application.

## How It Works

### 1. **Database Structure**

- **Table**: `hospital_variables`
- **Relationship**: Each variable belongs to one hospital (one-to-many)
- **Security**: Row Level Security (RLS) ensures users only see their hospital's variables

### 2. **Variable Types**

- **Number**: For numeric values (e.g., energy targets, water targets)
- **Text**: For string values (e.g., hospital policies, notes)
- **Boolean**: For true/false flags (e.g., feature toggles)
- **JSON**: For complex data structures (e.g., custom metrics arrays)

### 3. **Access Control**

- **Admins**: Can view, create, edit, and delete variables for ALL hospitals
- **Department Heads**: Can only VIEW variables for their assigned hospital

## Setup Instructions

### Step 1: Run Database Setup

Execute the SQL commands in `database-setup.sql` in your Supabase SQL Editor:

```sql
-- This creates the table, policies, and sample data
-- Run the entire database-setup.sql file
```

### Step 2: Access the Admin Interface

1. Log in as an admin user
2. Navigate to `/admin/hospital-variables`
3. Select a hospital from the dropdown
4. Start adding variables

### Step 3: Use Variables in Your App

Import and use the `useHospitalVariables` hook in your components:

```typescript
import { useHospitalVariables } from "@/hooks/useHospitalVariables";

function MyComponent({ hospitalId }) {
  const { variables, getVariableValue } = useHospitalVariables(hospitalId);

  // Get a specific variable value
  const energyTarget = getVariableValue("energy_target_kwh");

  // Use it in your component
  return <div>Energy Target: {energyTarget} kWh</div>;
}
```

## Example Use Cases

### 1. **Energy Targets**

```typescript
// Admin sets: energy_target_kwh = 50000
// In forms, show progress bars and warnings
const energyTarget = getVariableValue("energy_target_kwh");
if (currentUsage > energyTarget) {
  // Show warning
}
```

### 2. **Feature Flags**

```typescript
// Admin sets: enable_renewable_tracking = true
const enableRenewable = getVariableValue("enable_renewable_tracking");
if (enableRenewable) {
  // Show renewable energy fields
}
```

### 3. **Custom Metrics**

```typescript
// Admin sets: custom_metrics = ["co2_emissions", "waste_recycling"]
const customMetrics = getVariableValue("custom_metrics");
// Dynamically render form fields based on this array
```

## Components Available

### 1. **Admin Interface** (`/admin/hospital-variables`)

- Select hospital from dropdown
- Add/edit/delete variables
- Support for all variable types
- Real-time validation and error handling

### 2. **Display Component** (`HospitalVariableDisplay`)

```typescript
import HospitalVariableDisplay from "@/components/dashboard/HospitalVariableDisplay";

// In department dashboard
<HospitalVariableDisplay
  hospitalId={user.hospital_id}
  title="Hospital Configuration"
/>;
```

### 3. **Form Integration** (`DynamicFormWithVariables`)

```typescript
import DynamicFormWithVariables from "@/components/forms/DynamicFormWithVariables";

// Enhanced form with target tracking
<DynamicFormWithVariables
  hospitalId={user.hospital_id}
  formData={formData}
  onFormDataChange={setFormData}
/>;
```

## Best Practices

### 1. **Variable Naming**

- Use descriptive names: `energy_target_kwh` not `target1`
- Use snake_case for consistency
- Include units when relevant: `water_target_m3`

### 2. **Default Values**

- Always provide sensible defaults in your code
- Check if variables exist before using them
- Handle missing variables gracefully

### 3. **Performance**

- Variables are cached per hospital
- Only fetch when needed
- Use the `getVariableValue` helper for single values

## Example Implementation

### Setting Up Variables (Admin)

1. Go to `/admin/hospital-variables`
2. Select "Central Hospital"
3. Add variable:
   - Name: `energy_target_kwh`
   - Type: `number`
   - Value: `50000`
   - Description: `Monthly energy consumption target in kWh`

### Using Variables (Department)

```typescript
// In your data entry form
const { getVariableValue } = useHospitalVariables(hospitalId);
const energyTarget = getVariableValue("energy_target_kwh");

// Show target in form
<div>
  <label>Energy Usage (kWh)</label>
  <input type="number" />
  {energyTarget && <small>Target: {energyTarget.toLocaleString()} kWh</small>}
</div>;
```

## Troubleshooting

### Common Issues

1. **Variables not showing**

   - Check if user has correct role (admin or department head)
   - Verify hospital assignment for department users
   - Check RLS policies in Supabase

2. **Permission errors**

   - Ensure user is logged in
   - Verify user role in profiles table
   - Check hospital_id assignment

3. **Type conversion issues**
   - Use the `parseVariableValue` helper function
   - Handle different data types appropriately
   - Validate input before saving

### Debug Mode

Add this to see what variables are available:

```typescript
const { variables } = useHospitalVariables(hospitalId);
console.log("Available variables:", variables);
```

## Security Notes

- Variables are protected by RLS policies
- Department users can only view their hospital's variables
- Only admins can modify variables
- All changes are logged with timestamps
- Variables are validated before saving

## Future Enhancements

1. **Variable Templates**: Pre-defined variable sets for different hospital types
2. **Variable History**: Track changes over time
3. **Bulk Operations**: Import/export variables
4. **Variable Dependencies**: Variables that depend on other variables
5. **Conditional Logic**: Show/hide form fields based on variable values

This system provides a flexible foundation for hospital-specific configuration while maintaining security and ease of use.
