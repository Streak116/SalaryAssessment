'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Users, Plus, Search } from 'lucide-react';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../../lib/api';
import type { Employee, GetEmployeesParams } from '../../lib/api';
import { useDialog } from '@/context/DialogContext';

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
import EmployeeDrawer, { FormValues, EMPTY_FORM } from '@/components/EmployeeDrawer';
import EmployeeTable from '@/components/EmployeeTable';

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
  const handlePageChange = (p: number) => {
    setPage(p);
    fetchEmployees({ page: p });
  };

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

      {/* Table & Pagination */}
      <EmployeeTable
        employees={employees}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onEdit={openEdit}
        onDelete={handleDeleteClick}
      />

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
