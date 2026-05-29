'use client';

import React, { useState } from 'react';

export const EMPTY_FORM = {
  fullName: '',
  jobTitle: '',
  country: '',
  department: '',
  salary: '',
  email: '',
  hireDate: '',
  employmentType: 'Full-time' as 'Full-time' | 'Part-time' | 'Contractor' | 'Intern',
  gender: 'Male' as 'Male' | 'Female' | 'Non-binary',
  isActive: true,
};

export type FormValues = typeof EMPTY_FORM;
export type FormErrors = Partial<Record<keyof FormValues, string>>;

export function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!values.fullName.trim()) {
    errors.fullName = 'Full Name is required';
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = 'Full Name must be at least 2 characters';
  }

  if (!values.jobTitle.trim()) {
    errors.jobTitle = 'Job Title is required';
  }

  if (!values.country.trim()) {
    errors.country = 'Country is required';
  }

  if (!values.department.trim()) {
    errors.department = 'Department is required';
  }

  if (!values.salary) {
    errors.salary = 'Salary is required';
  } else if (Number(values.salary) <= 0) {
    errors.salary = 'Salary must be a positive number';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_RE.test(values.email)) {
    errors.email = 'Invalid email address';
  }

  return errors;
}

interface EmployeeDrawerProps {
  open: boolean;
  mode: 'add' | 'edit';
  initial: FormValues;
  onClose: () => void;
  onSave: (values: FormValues) => Promise<void>;
}

export default function EmployeeDrawer({
  open,
  mode,
  initial,
  onClose,
  onSave,
}: EmployeeDrawerProps) {
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    // Clear the error for this field as the user corrects it
    if (errors[name as keyof FormValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setSaving(true);
    await onSave(values);
    setSaving(false);
  };

  if (!open) return null;

  const fields: Array<{ label: string; name: keyof FormValues; type?: string }> = [
    { label: 'Full Name',   name: 'fullName' },
    { label: 'Job Title',   name: 'jobTitle' },
    { label: 'Country',     name: 'country' },
    { label: 'Department',  name: 'department' },
    { label: 'Salary',      name: 'salary',   type: 'number' },
    { label: 'Email',       name: 'email',    type: 'email' },
    { label: 'Hire Date',   name: 'hireDate', type: 'date' },
  ];

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer panel */}
      <div className="relative w-full max-w-md h-full bg-card border-l border-border flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="text-lg font-bold text-foreground capitalize">
            {mode === 'add' ? 'Add Employee' : 'Edit Employee'}
          </h2>
          <button
            aria-label="Close drawer"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form noValidate onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
          {fields.map(({ label, name, type = 'text' }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <label htmlFor={`field-${name}`} className="text-sm font-medium text-foreground">
                {label}
              </label>
              <input
                id={`field-${name}`}
                name={name}
                type={type}
                value={values[name] as string}
                onChange={handleChange}
                aria-label={label}
                aria-invalid={!!errors[name]}
                className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors bg-muted/20 ${
                  errors[name]
                    ? 'border-destructive focus:ring-destructive/30 focus:border-destructive'
                    : 'border-border focus:ring-primary/50 focus:border-primary'
                }`}
              />
              {errors[name] && (
                <p className="text-xs text-destructive font-medium">{errors[name]}</p>
              )}
            </div>
          ))}

          {/* Employment Type select */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="field-employmentType" className="text-sm font-medium text-foreground">
              Employment Type
            </label>
            <select
              id="field-employmentType"
              name="employmentType"
              value={values.employmentType}
              onChange={(e) => {
                setValues((v) => ({ ...v, employmentType: e.target.value as FormValues['employmentType'] }));
              }}
              aria-label="Employment Type"
              className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-muted/20 text-foreground"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contractor">Contractor</option>
              <option value="Intern">Intern</option>
            </select>
          </div>

          {/* Gender select */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="field-gender" className="text-sm font-medium text-foreground">
              Gender
            </label>
            <select
              id="field-gender"
              name="gender"
              value={values.gender}
              onChange={(e) => {
                setValues((v) => ({ ...v, gender: e.target.value as FormValues['gender'] }));
              }}
              aria-label="Gender"
              className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-muted/20 text-foreground"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
            </select>
          </div>

          {/* Active Status checkbox */}
          <div className="flex items-center gap-2 py-1">
            <input
              id="field-isActive"
              name="isActive"
              type="checkbox"
              checked={values.isActive}
              onChange={(e) => {
                setValues((v) => ({ ...v, isActive: e.target.checked }));
              }}
              aria-label="Active Status"
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary bg-muted/20"
            />
            <label htmlFor="field-isActive" className="text-sm font-medium text-foreground">
              Active Employee
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              aria-label="Save"
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
