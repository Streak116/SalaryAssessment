import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import EmployeesPage from '@/app/employees/page';

// ---------------------------------------------------------------------------
// Mock next/navigation
// ---------------------------------------------------------------------------
vi.mock('next/navigation', () => ({
  usePathname: () => '/employees',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

// ---------------------------------------------------------------------------
// Mock API client
// ---------------------------------------------------------------------------
vi.mock('@/lib/api', () => ({
  getEmployees: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
}));

import * as api from '@/lib/api';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const MOCK_EMPLOYEES = [
  {
    id: 'emp-1',
    fullName: 'Alice Johnson',
    jobTitle: 'Software Engineer',
    country: 'USA',
    department: 'Engineering',
    salary: 95000,
    hireDate: '2022-03-15T00:00:00.000Z',
    email: 'alice.johnson@example.com',
    employmentType: 'Full-time' as const,
    gender: 'Female' as const,
    isActive: true,
  },
  {
    id: 'emp-2',
    fullName: 'Bob Smith',
    jobTitle: 'Product Manager',
    country: 'UK',
    department: 'Product',
    salary: 88000,
    hireDate: '2021-07-20T00:00:00.000Z',
    email: 'bob.smith@example.com',
    employmentType: 'Part-time' as const,
    gender: 'Male' as const,
    isActive: true,
  },
  {
    id: 'emp-3',
    fullName: 'Carol White',
    jobTitle: 'Designer',
    country: 'Canada',
    department: 'Design',
    salary: 72000,
    hireDate: '2023-01-10T00:00:00.000Z',
    email: 'carol.white@example.com',
    employmentType: 'Contractor' as const,
    gender: 'Non-binary' as const,
    isActive: true,
  },
];

const MOCK_PAGINATED_RESPONSE = {
  data: MOCK_EMPLOYEES,
  pagination: { total: 3, page: 1, limit: 20, totalPages: 1 },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Employees Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getEmployees).mockResolvedValue(MOCK_PAGINATED_RESPONSE);
  });

  // -------------------------------------------------------------------------
  // Table rendering
  // -------------------------------------------------------------------------
  describe('Employee Table', () => {
    it('renders the page heading', async () => {
      render(<EmployeesPage />);
      expect(screen.getByRole('heading', { name: /employees/i })).toBeInTheDocument();
    });

    it('displays employee rows after loading', async () => {
      render(<EmployeesPage />);
      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.getByText('Carol White')).toBeInTheDocument();
      });
    });

    it('displays job title and country for each employee', async () => {
      render(<EmployeesPage />);
      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
        expect(screen.getByText('USA')).toBeInTheDocument();
        expect(screen.getByText('Product Manager')).toBeInTheDocument();
      });
    });

    it('shows total employee count', async () => {
      render(<EmployeesPage />);
      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('calls getEmployees on mount', async () => {
      render(<EmployeesPage />);
      await waitFor(() => {
        expect(api.getEmployees).toHaveBeenCalledTimes(1);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Search
  // -------------------------------------------------------------------------
  describe('Search', () => {
    it('renders a search input', async () => {
      render(<EmployeesPage />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('calls getEmployees with search query on input change', async () => {
      render(<EmployeesPage />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'Alice' } });
      await waitFor(() => {
        expect(api.getEmployees).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'Alice' })
        );
      });
    });
  });

  // -------------------------------------------------------------------------
  // Add Employee Drawer
  // -------------------------------------------------------------------------
  describe('Add Employee Drawer', () => {
    it('renders an "Add Employee" button', async () => {
      render(<EmployeesPage />);
      expect(screen.getByRole('button', { name: /add employee/i })).toBeInTheDocument();
    });

    it('opens the drawer when "Add Employee" is clicked', async () => {
      render(<EmployeesPage />);
      const addButton = screen.getByRole('button', { name: /add employee/i });
      fireEvent.click(addButton);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /add employee/i })).toBeInTheDocument();
      });
    });

    it('drawer contains all required form fields', async () => {
      render(<EmployeesPage />);
      fireEvent.click(screen.getByRole('button', { name: /add employee/i }));
      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/salary/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/employment type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/active status/i)).toBeInTheDocument();
      });
    });

    it('calls createEmployee with form data on submit', async () => {
      vi.mocked(api.createEmployee).mockResolvedValue({ ...MOCK_EMPLOYEES[0], id: 'emp-new' });
      render(<EmployeesPage />);
      fireEvent.click(screen.getByRole('button', { name: /add employee/i }));

      await waitFor(() => screen.getByLabelText(/full name/i));

      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'New Person' } });
      fireEvent.change(screen.getByLabelText(/job title/i), { target: { value: 'Analyst' } });
      fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'USA' } });
      fireEvent.change(screen.getByLabelText(/department/i), { target: { value: 'Finance' } });
      fireEvent.change(screen.getByLabelText(/salary/i), { target: { value: '60000' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@example.com' } });

      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(api.createEmployee).toHaveBeenCalledWith(
          expect.objectContaining({ fullName: 'New Person', jobTitle: 'Analyst' })
        );
      });
    });
  });

  // -------------------------------------------------------------------------
  // Edit Employee Drawer
  // -------------------------------------------------------------------------
  describe('Edit Employee Drawer', () => {
    it('renders an edit button for each employee row', async () => {
      render(<EmployeesPage />);
      await waitFor(() => screen.getByText('Alice Johnson'));
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons.length).toBe(MOCK_EMPLOYEES.length);
    });

    it('opens the drawer pre-filled with employee data on edit click', async () => {
      render(<EmployeesPage />);
      await waitFor(() => screen.getByText('Alice Johnson'));

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /edit employee/i })).toBeInTheDocument();
        expect(screen.getByDisplayValue('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument();
      });
    });

    it('calls updateEmployee on save', async () => {
      vi.mocked(api.updateEmployee).mockResolvedValue(MOCK_EMPLOYEES[0]);
      render(<EmployeesPage />);
      await waitFor(() => screen.getByText('Alice Johnson'));

      fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);
      await waitFor(() => screen.getByDisplayValue('Alice Johnson'));

      fireEvent.change(screen.getByDisplayValue('Alice Johnson'), {
        target: { value: 'Alice Johnson Updated' },
      });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(api.updateEmployee).toHaveBeenCalledWith(
          'emp-1',
          expect.objectContaining({ fullName: 'Alice Johnson Updated' })
        );
      });
    });
  });

  // -------------------------------------------------------------------------
  // Delete Employee
  // -------------------------------------------------------------------------
  describe('Delete Employee', () => {
    it('renders a delete button for each employee row', async () => {
      render(<EmployeesPage />);
      await waitFor(() => screen.getByText('Alice Johnson'));
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      expect(deleteButtons.length).toBe(MOCK_EMPLOYEES.length);
    });

    it('shows a confirmation dialog when delete is clicked', async () => {
      render(<EmployeesPage />);
      await waitFor(() => screen.getByText('Alice Johnson'));

      fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });
    });

    it('calls deleteEmployee when confirmed', async () => {
      vi.mocked(api.deleteEmployee).mockResolvedValue(undefined);
      render(<EmployeesPage />);
      await waitFor(() => screen.getByText('Alice Johnson'));

      fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
      await waitFor(() => screen.getByRole('dialog'));

      fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

      await waitFor(() => {
        expect(api.deleteEmployee).toHaveBeenCalledWith('emp-1');
      });
    });

    it('does not call deleteEmployee when cancelled', async () => {
      render(<EmployeesPage />);
      await waitFor(() => screen.getByText('Alice Johnson'));

      fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
      await waitFor(() => screen.getByRole('dialog'));

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(api.deleteEmployee).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Pagination
  // -------------------------------------------------------------------------
  describe('Pagination', () => {
    it('renders pagination controls', async () => {
      vi.mocked(api.getEmployees).mockResolvedValue({
        data: MOCK_EMPLOYEES,
        pagination: { total: 60, page: 1, limit: 20, totalPages: 3 },
      });
      render(<EmployeesPage />);
      await waitFor(() => screen.getByText('Alice Johnson'));
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    });

    it('calls getEmployees with next page when Next is clicked', async () => {
      vi.mocked(api.getEmployees).mockResolvedValue({
        data: MOCK_EMPLOYEES,
        pagination: { total: 60, page: 1, limit: 20, totalPages: 3 },
      });
      render(<EmployeesPage />);
      await waitFor(() => screen.getByText('Alice Johnson'));

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(api.getEmployees).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 })
        );
      });
    });

    it('disables the Previous button on page 1', async () => {
      render(<EmployeesPage />);
      await waitFor(() => screen.getByText('Alice Johnson'));
      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    });
  });

  // -------------------------------------------------------------------------
  // Form Validation
  // -------------------------------------------------------------------------
  describe('Form Validation', () => {
    beforeEach(async () => {
      render(<EmployeesPage />);
      fireEvent.click(screen.getByRole('button', { name: /add employee/i }));
      await waitFor(() => screen.getByLabelText(/full name/i));
    });

    it('shows error when Full Name is empty on submit', async () => {
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
      });
      expect(api.createEmployee).not.toHaveBeenCalled();
    });

    it('shows error when Full Name is too short', async () => {
      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'A' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
      });
      expect(api.createEmployee).not.toHaveBeenCalled();
    });

    it('shows error when Job Title is empty on submit', async () => {
      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText(/job title is required/i)).toBeInTheDocument();
      });
    });

    it('shows error when Country is empty on submit', async () => {
      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/job title/i), { target: { value: 'Engineer' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText(/country is required/i)).toBeInTheDocument();
      });
    });

    it('shows error when Department is empty on submit', async () => {
      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/job title/i), { target: { value: 'Engineer' } });
      fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'USA' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText(/department is required/i)).toBeInTheDocument();
      });
    });

    it('shows error when Salary is empty on submit', async () => {
      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/job title/i), { target: { value: 'Engineer' } });
      fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'USA' } });
      fireEvent.change(screen.getByLabelText(/department/i), { target: { value: 'Engineering' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText(/salary is required/i)).toBeInTheDocument();
      });
    });

    it('shows error when Salary is not a positive number', async () => {
      fireEvent.change(screen.getByLabelText(/salary/i), { target: { value: '-500' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText(/salary must be a positive number/i)).toBeInTheDocument();
      });
    });

    it('shows error when Email is empty on submit', async () => {
      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/job title/i), { target: { value: 'Engineer' } });
      fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'USA' } });
      fireEvent.change(screen.getByLabelText(/department/i), { target: { value: 'Engineering' } });
      fireEvent.change(screen.getByLabelText(/salary/i), { target: { value: '50000' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('shows error when Email format is invalid', async () => {
      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/job title/i), { target: { value: 'Engineer' } });
      fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'USA' } });
      fireEvent.change(screen.getByLabelText(/department/i), { target: { value: 'Engineering' } });
      fireEvent.change(screen.getByLabelText(/salary/i), { target: { value: '50000' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'not-an-email' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });
    });

    it('clears error when user corrects the field', async () => {
      // First trigger the error
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => screen.getByText(/full name is required/i));

      // Then fix the field
      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
      await waitFor(() => {
        expect(screen.queryByText(/full name is required/i)).not.toBeInTheDocument();
      });
    });

    it('does not call createEmployee when form has validation errors', async () => {
      // Submit with completely empty form
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => screen.getByText(/full name is required/i));
      expect(api.createEmployee).not.toHaveBeenCalled();
    });
  });
});
