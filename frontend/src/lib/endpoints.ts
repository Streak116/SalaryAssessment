/**
 * Centralized API endpoint constants.
 * All route paths consumed by the frontend client are defined here.
 */

export const ENDPOINTS = {
  EMPLOYEES:              '/api/employees',
  EMPLOYEE_BY_ID:         (id: string) => `/api/employees/${id}`,
  DASHBOARD_SUMMARY:      '/api/insights/dashboard-summary',
  COUNTRY_STATS:          '/api/insights/country-stats',
  JOB_TITLE_STATS:        '/api/insights/job-title-stats',
} as const;
