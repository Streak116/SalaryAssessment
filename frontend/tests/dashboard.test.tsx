import { render as rtlRender, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import DashboardPage from '@/app/page';
import { DialogProvider } from '@/context/DialogContext';

const render = (ui: React.ReactNode) => rtlRender(ui, { wrapper: DialogProvider });

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock('@/lib/api', () => ({
  getDashboardSummary: vi.fn(),
  getCountryStats: vi.fn(),
  getJobTitleStats: vi.fn(),
}));

import * as api from '@/lib/api';

const MOCK_DASHBOARD_SUMMARY = {
  totalActiveHeadcount: 15,
  totalInactiveHeadcount: 5,
  totalActivePayroll: 1500000,
  globalAverageSalary: 100000,
  departmentStats: [
    { department: 'Engineering', avgSalary: 120000, count: 5 },
    { department: 'Design', avgSalary: 90000, count: 5 },
    { department: 'Marketing', avgSalary: 70000, count: 5 },
  ],
};

const MOCK_COUNTRY_STATS = [
  { country: 'USA', minSalary: 60000, maxSalary: 200000, avgSalary: 110000, count: 10 },
  { country: 'Canada', minSalary: 50000, maxSalary: 150000, avgSalary: 90000, count: 5 },
];

const MOCK_JOB_TITLE_STATS_USA = [
  { jobTitle: 'Software Engineer', avgSalary: 130000, count: 6 },
  { jobTitle: 'Product Manager', avgSalary: 110000, count: 4 },
];

const MOCK_JOB_TITLE_STATS_CANADA = [
  { jobTitle: 'Software Engineer', avgSalary: 100000, count: 3 },
  { jobTitle: 'Designer', avgSalary: 80000, count: 2 },
];

describe('Salary Insights Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getDashboardSummary).mockResolvedValue(MOCK_DASHBOARD_SUMMARY);
    vi.mocked(api.getCountryStats).mockResolvedValue(MOCK_COUNTRY_STATS);
    vi.mocked(api.getJobTitleStats).mockImplementation((c) => {
      if (c === 'Canada') return Promise.resolve(MOCK_JOB_TITLE_STATS_CANADA);
      return Promise.resolve(MOCK_JOB_TITLE_STATS_USA);
    });
  });

  it('calls fetch APIs on mount', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(api.getDashboardSummary).toHaveBeenCalledTimes(1);
      expect(api.getCountryStats).toHaveBeenCalledTimes(1);
      expect(api.getJobTitleStats).toHaveBeenCalledWith('USA'); // defaults to first country
    });
  });

  it('renders summary KPI metrics correctly', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      // Check headcounts
      expect(screen.getByText('15')).toBeInTheDocument(); // active headcount
      expect(screen.getByText('5')).toBeInTheDocument(); // inactive headcount
      
      // Check Total Payroll ($1,500,000)
      expect(screen.getByText(/\$1,500,000/)).toBeInTheDocument();
      
      // Check average salary ($100,000)
      expect(screen.getByText(/\$100,000/)).toBeInTheDocument();
    });
  });

  it('renders department statistics and relative CSS bar charts', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
      expect(screen.getByText('Design')).toBeInTheDocument();
      expect(screen.getByText('Marketing')).toBeInTheDocument();

      // Check counts & average salaries
      expect(screen.getAllByText(/\$120,000/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/5 employees/i).length).toBe(3);
    });
  });

  it('renders country stats list', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/USA/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Canada/)[0]).toBeInTheDocument();

      // Check count, min, max, average
      expect(screen.getAllByText(/\$110,000/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/\$90,000/)[0]).toBeInTheDocument();
      expect(screen.getByText(/\$60,000 - \$200,000/)).toBeInTheDocument();
      expect(screen.getByText(/\$50,000 - \$150,000/)).toBeInTheDocument();
    });
  });

  it('changes job title stats when changing selected country dropdown', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/Product Manager/)[0]).toBeInTheDocument();
      expect(screen.queryByText(/Designer/)).not.toBeInTheDocument();
    });

    const select = screen.getByLabelText(/select country/i);
    fireEvent.change(select, { target: { value: 'Canada' } });

    await waitFor(() => {
      expect(api.getJobTitleStats).toHaveBeenCalledWith('Canada');
      expect(screen.getAllByText(/Designer/)[0]).toBeInTheDocument();
      expect(screen.queryByText(/Product Manager/)).not.toBeInTheDocument();
    });
  });

  it('displays warning dialog when dashboard API load fails', async () => {
    vi.mocked(api.getDashboardSummary).mockRejectedValue(new Error('API Error'));
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/error loading dashboard data/i)).toBeInTheDocument();
      expect(screen.getByText(/api error/i)).toBeInTheDocument();
    });
  });
});
