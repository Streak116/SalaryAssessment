'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pencil, Trash2 } from 'lucide-react';
import type { Employee } from '@/lib/api';

interface EmployeeTableProps {
  employees: Employee[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
}

export default function EmployeeTable({
  employees,
  loading,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  const [inputPage, setInputPage] = useState(String(page));

  useEffect(() => {
    Promise.resolve().then(() => {
      setInputPage(String(page));
    });
  }, [page]);

  const handlePageSubmit = () => {
    const parsed = parseInt(inputPage, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > totalPages) {
      setInputPage(String(page)); // reset
      return;
    }
    onPageChange(parsed);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageSubmit();
    }
  };

  const inputWidthPx = Math.max(3, String(totalPages).length) * 12 + 16;

  const formatSalary = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
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
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-5 py-4">
                    <div className="h-4 w-28 bg-muted rounded" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-36 bg-muted rounded" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-24 bg-muted rounded" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-5 w-16 bg-muted rounded-full" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-20 bg-muted rounded font-mono" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-24 bg-muted rounded" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <div className="w-7 h-7 bg-muted rounded-lg" />
                      <div className="w-7 h-7 bg-muted rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))
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
                        onClick={() => onEdit(emp)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        aria-label="Delete"
                        onClick={() => onDelete(emp)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors cursor-pointer"
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
      <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-muted/20 flex-wrap gap-4">
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          Page {page} of {totalPages}
        </p>

        {/* Jump to specific page input */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Go to:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onKeyDown={handleInputKeyDown}
            aria-label="Go to page"
            style={{ width: `${inputWidthPx}px` }}
            className="px-1.5 py-1 text-center rounded border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-mono text-xs"
          />
          <button
            onClick={handlePageSubmit}
            className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity cursor-pointer text-xs"
          >
            Go
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="First"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
            First
          </button>
          <button
            aria-label="Previous"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>
          <button
            aria-label="Next"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            aria-label="Last"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer"
          >
            Last
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
