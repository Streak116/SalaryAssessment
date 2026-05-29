'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Users, Plus, Search, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../../lib/api';
import type { Employee, GetEmployeesParams } from '../../lib/api';
import { useDialog } from '@/context/DialogContext';

// ---------------------------------------------------------------------------
// Sub-components (inline for now — extracted in refactor step)
// ---------------------------------------------------------------------------

/** Employee Drawer (Add / Edit) */
const EMPTY_FORM = {
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

type FormValues = typeof EMPTY_FORM;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
type FormErrors = Partial<Record<keyof FormValues, string>>;

function validate(values: FormValues): FormErrors {
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

function EmployeeDrawer({
  open,
  mode,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: 'add' | 'edit';
  initial: FormValues;
  onClose: () => void;
  onSave: (values: FormValues) => Promise<void>;
}) {
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


// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function EmployeesPage() {
  const { showDialog } = useDialog();

  // ---- state ----------------------------------------------------------------
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);

  // Drawer
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [drawerMode, setDrawerMode]   = useState<'add' | 'edit'>('add');
  const [editTarget, setEditTarget]   = useState<Employee | null>(null);

  const LIMIT = 20;

  // ---- data fetching --------------------------------------------------------
  const fetchEmployees = useCallback(
    async (params: GetEmployeesParams = {}) => {
      setLoading(true);
      try {
        const res = await getEmployees({ page, limit: LIMIT, search, ...params });
        setEmployees(res.data);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      } finally {
        setLoading(false);
      }
    },
    [page, search]
  );

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchEmployees();
    });
  }, [fetchEmployees]);

  // Search triggers reset to page 1
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
    fetchEmployees({ search: value, page: 1 });
  };

  // ---- drawer helpers -------------------------------------------------------
  const openAdd = () => {
    setDrawerMode('add');
    setEditTarget(null);
    setDrawerOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setDrawerMode('edit');
    setEditTarget(emp);
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const initialFormValues = (emp: Employee | null): FormValues => {
    if (!emp) return { ...EMPTY_FORM };
    return {
      fullName:   emp.fullName,
      jobTitle:   emp.jobTitle,
      country:    emp.country,
      department: emp.department,
      salary:     String(emp.salary),
      email:      emp.email,
      hireDate:   emp.hireDate ? emp.hireDate.substring(0, 10) : '',
      employmentType: emp.employmentType,
      gender:     emp.gender,
      isActive:   emp.isActive ?? true,
    };
  };

  const handleSave = async (values: FormValues) => {
    const payload = {
      fullName:   values.fullName,
      jobTitle:   values.jobTitle,
      country:    values.country,
      department: values.department,
      salary:     Number(values.salary),
      email:      values.email,
      hireDate:   values.hireDate ? new Date(values.hireDate).toISOString() : new Date().toISOString(),
      employmentType: values.employmentType,
      gender:     values.gender,
      isActive:   values.isActive,
    };

    if (drawerMode === 'add') {
      await createEmployee(payload);
      closeDrawer();
      fetchEmployees();
      await showDialog({
        type: 'info',
        title: 'Employee Created',
        message: `Employee "${payload.fullName}" has been successfully created.`,
      });
    } else if (editTarget) {
      await updateEmployee(editTarget.id, payload);
      closeDrawer();
      fetchEmployees();
      await showDialog({
        type: 'info',
        title: 'Employee Updated',
        message: `Employee "${payload.fullName}" has been successfully updated.`,
      });
    }
  };

  // ---- delete ---------------------------------------------------------------
  const handleDeleteClick = async (emp: Employee) => {
    const confirmed = await showDialog({
      type: 'confirmation',
      title: 'Delete Employee',
      message: `Are you sure you want to delete this employee? This action cannot be undone.`,
    });
    if (confirmed) {
      await deleteEmployee(emp.id);
      fetchEmployees();
    }
  };

  // ---- pagination -----------------------------------------------------------
  const goToPage = (p: number) => {
    setPage(p);
    fetchEmployees({ page: p });
  };

  const formatSalary = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // --------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Employees</h1>
            <p className="text-sm text-muted-foreground">
              <span>{total.toLocaleString()}</span> total records
            </p>
          </div>
        </div>

        <button
          aria-label="Add Employee"
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Search bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search employees…"
          value={search}
          onChange={handleSearchChange}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
        />
      </div>

      {/* Table card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Name', 'Job Title', 'Department', 'Country', 'Salary', 'Hire Date', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground text-sm">
                    Loading…
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground text-sm">
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="px-5 py-4 font-medium text-foreground whitespace-nowrap">
                      {emp.fullName}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                      {emp.jobTitle}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                      {emp.department}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                        {emp.country}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-foreground whitespace-nowrap">
                      {formatSalary(emp.salary)}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(emp.hireDate)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          aria-label="Edit"
                          onClick={() => openEdit(emp)}
                          className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          aria-label="Delete"
                          onClick={() => handleDeleteClick(emp)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              aria-label="Previous"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              aria-label="Next"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Drawers & Dialogs */}
      <EmployeeDrawer
        key={drawerOpen ? `${drawerMode}-${editTarget?.id ?? 'new'}` : 'closed'}
        open={drawerOpen}
        mode={drawerMode}
        initial={initialFormValues(editTarget)}
        onClose={closeDrawer}
        onSave={handleSave}
      />
    </div>
  );
}
