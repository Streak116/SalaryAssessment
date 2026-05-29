import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname() {
    return '/';
  },
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    };
  },
}));

describe('Layout Components', () => {
  describe('Sidebar Component', () => {
    it('renders the application branding', () => {
      render(<Sidebar />);
      expect(screen.getByText(/SalaryPro/i)).toBeInTheDocument();
    });

    it('renders navigation links', () => {
      render(<Sidebar />);
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      const employeesLink = screen.getByRole('link', { name: /employees/i });

      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink).toHaveAttribute('href', '/');
      expect(employeesLink).toBeInTheDocument();
      expect(employeesLink).toHaveAttribute('href', '/employees');
    });
  });

  describe('Header Component', () => {
    it('renders header text/actions', () => {
      render(<Header />);
      expect(screen.getByText(/Organization Overview/i)).toBeInTheDocument();
    });
  });
});
