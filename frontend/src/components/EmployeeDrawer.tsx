'use client';

import React, { useState } from 'react';
import SearchableDropdown from './SearchableDropdown';
import { COUNTRIES, DEPARTMENTS, JOB_TITLES_BY_DEPT, ALL_JOB_TITLES, EMPLOYMENT_TYPES, GENDERS } from '../lib/constants';

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

  const handleDropdownChange = (name: keyof FormValues) => (val: string) => {
    setValues((v) => ({ ...v, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDepartmentChange = (dept: string) => {
    setValues((v) => {
      const oldDeptTitles = JOB_TITLES_BY_DEPT[v.department] || [];
      const shouldClear = oldDeptTitles.includes(v.jobTitle) && !(JOB_TITLES_BY_DEPT[dept] || []).includes(v.jobTitle);
      const newJobTitle = shouldClear ? '' : v.jobTitle;
      return {
        ...v,
        department: dept,
        jobTitle: newJobTitle,
      };
    });
    setErrors((prev) => ({ ...prev, department: undefined, jobTitle: undefined }));
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
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="field-fullName" className="text-sm font-medium text-foreground">
              Full Name
            </label>
            <input
              id="field-fullName"
              name="fullName"
              type="text"
              value={values.fullName}
              onChange={handleChange}
              aria-label="Full Name"
              aria-invalid={!!errors.fullName}
              className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors bg-muted/20 ${
                errors.fullName
                  ? 'border-destructive focus:ring-destructive/30 focus:border-destructive'
                  : 'border-border focus:ring-primary/50 focus:border-primary'
              }`}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive font-medium">{errors.fullName}</p>
            )}
          </div>

          {/* Department */}
          <SearchableDropdown
            id="field-department"
            label="Department"
            value={values.department}
            onChange={handleDepartmentChange}
            options={DEPARTMENTS}
            placeholder="Select department..."
            error={errors.department}
          />

          {/* Job Title */}
          <SearchableDropdown
            id="field-jobTitle"
            label="Job Title"
            value={values.jobTitle}
            onChange={handleDropdownChange('jobTitle')}
            options={values.department ? (JOB_TITLES_BY_DEPT[values.department] || []) : ALL_JOB_TITLES}
            placeholder={values.department ? `Select title in ${values.department}...` : "Select job title..."}
            error={errors.jobTitle}
          />

          {/* Country */}
          <SearchableDropdown
            id="field-country"
            label="Country"
            value={values.country}
            onChange={handleDropdownChange('country')}
            options={COUNTRIES}
            placeholder="Select country..."
            error={errors.country}
          />

          {/* Salary */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="field-salary" className="text-sm font-medium text-foreground">
              Salary
            </label>
            <input
              id="field-salary"
              name="salary"
              type="number"
              value={values.salary}
              onChange={handleChange}
              aria-label="Salary"
              aria-invalid={!!errors.salary}
              className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors bg-muted/20 ${
                errors.salary
                  ? 'border-destructive focus:ring-destructive/30 focus:border-destructive'
                  : 'border-border focus:ring-primary/50 focus:border-primary'
              }`}
            />
            {errors.salary && (
              <p className="text-xs text-destructive font-medium">{errors.salary}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="field-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="field-email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              aria-label="Email"
              aria-invalid={!!errors.email}
              className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors bg-muted/20 ${
                errors.email
                  ? 'border-destructive focus:ring-destructive/30 focus:border-destructive'
                  : 'border-border focus:ring-primary/50 focus:border-primary'
              }`}
            />
            {errors.email && (
              <p className="text-xs text-destructive font-medium">{errors.email}</p>
            )}
          </div>

          {/* Hire Date */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="field-hireDate" className="text-sm font-medium text-foreground">
              Hire Date
            </label>
            <input
              id="field-hireDate"
              name="hireDate"
              type="date"
              value={values.hireDate}
              onChange={handleChange}
              aria-label="Hire Date"
              aria-invalid={!!errors.hireDate}
              className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors bg-muted/20 ${
                errors.hireDate
                  ? 'border-destructive focus:ring-destructive/30 focus:border-destructive'
                  : 'border-border focus:ring-primary/50 focus:border-primary'
              }`}
            />
            {errors.hireDate && (
              <p className="text-xs text-destructive font-medium">{errors.hireDate}</p>
            )}
          </div>

          {/* Employment Type select */}
          <SearchableDropdown
            id="field-employmentType"
            label="Employment Type"
            value={values.employmentType}
            onChange={(val) => handleDropdownChange('employmentType')(val as FormValues['employmentType'])}
            options={EMPLOYMENT_TYPES}
            placeholder="Select employment type..."
            error={errors.employmentType}
          />

          {/* Gender select */}
          <SearchableDropdown
            id="field-gender"
            label="Gender"
            value={values.gender}
            onChange={(val) => handleDropdownChange('gender')(val as FormValues['gender'])}
            options={GENDERS}
            placeholder="Select gender..."
            error={errors.gender}
          />

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
