const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface Employee {
  id: string;
  fullName: string;
  jobTitle: string;
  country: string;
  department: string;
  salary: number;
  hireDate: string;
  email: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contractor' | 'Intern';
  gender: 'Male' | 'Female' | 'Non-binary';
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  department?: string;
}

export type CreateEmployeePayload = Omit<Employee, 'id'>;
export type UpdateEmployeePayload = Partial<CreateEmployeePayload>;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error?.message ?? 'Request failed');
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function getEmployees(
  params: GetEmployeesParams = {}
): Promise<PaginatedResponse<Employee>> {
  const qs = new URLSearchParams();
  if (params.page)       qs.set('page',       String(params.page));
  if (params.limit)      qs.set('limit',      String(params.limit));
  if (params.search)     qs.set('search',     params.search);
  if (params.country)    qs.set('country',    params.country);
  if (params.department) qs.set('department', params.department);
  const query = qs.toString();
  return request<PaginatedResponse<Employee>>(`/api/employees${query ? `?${query}` : ''}`);
}

export function createEmployee(payload: CreateEmployeePayload): Promise<Employee> {
  return request<Employee>('/api/employees', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateEmployee(id: string, payload: UpdateEmployeePayload): Promise<Employee> {
  return request<Employee>(`/api/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteEmployee(id: string): Promise<void> {
  return request<void>(`/api/employees/${id}`, { method: 'DELETE' });
}

export interface DepartmentStat {
  department: string;
  avgSalary: number;
  count: number;
}

export interface DashboardSummary {
  totalActiveHeadcount: number;
  totalInactiveHeadcount: number;
  totalActivePayroll: number;
  globalAverageSalary: number;
  departmentStats: DepartmentStat[];
}

export interface CountryStat {
  country: string;
  minSalary: number;
  maxSalary: number;
  avgSalary: number;
  count: number;
}

export interface JobTitleStat {
  jobTitle: string;
  avgSalary: number;
  count: number;
}

export function getDashboardSummary(): Promise<DashboardSummary> {
  return request<DashboardSummary>('/api/insights/dashboard-summary');
}

export function getCountryStats(): Promise<CountryStat[]> {
  return request<CountryStat[]>('/api/insights/country-stats');
}

export function getJobTitleStats(country: string): Promise<JobTitleStat[]> {
  const qs = new URLSearchParams();
  qs.set('country', country);
  return request<JobTitleStat[]>(`/api/insights/job-title-stats?${qs.toString()}`);
}
