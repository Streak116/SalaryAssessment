# Step 4 Approach: Salary Insights API & Database Aggregations

This document outlines the development approach, design decisions, and database optimization strategies used during the implementation of the Salary Insights endpoints.

---

## 1. Test-Driven Development (TDD) Workflow
We followed a strict **Red-Green-Refactor** development cycle, building out each aggregation feature incrementally. The exact sequence of steps was:

1. **Country Stats Aggregate (`GET /api/insights/country-stats`)**:
   - **Red**: Wrote a test checking that the endpoint returns an array of country statistics with the correct minimum, maximum, and average salaries, and headcount. Ran tests; it failed with `404 Not Found`.
   - **Green**: Implemented `getCountryStatsService` in `employeeService.ts` using Prisma's `groupBy` aggregation, mapped it through `insightsController.ts`, and mounted the prefix in `app.ts`. Verified the test passed.

2. **Job Title Stats by Country (`GET /api/insights/job-title-stats`)**:
   - **Red**: Wrote two tests asserting:
     - A missing `country` query parameter returns a `400 Bad Request`.
     - Specifying a country returns the correct average salaries and counts grouped by job titles (e.g., Software Engineer vs Product Manager in the USA).
     - Ran tests; they failed with `404 Not Found`.
   - **Green**: Added validation logic in the controller to throw an error if `country` is missing. Implemented `getJobTitleStatsService` using `groupBy` filtered by `country` and `isActive: true`. Verified the tests passed.

3. **Dashboard Summary (`GET /api/insights/dashboard-summary`)**:
   - **Red**: Wrote a test asserting organization-wide statistics: active headcount count (expecting 5), inactive headcount count (expecting 1), total active payroll sum, global average salary, and department aggregates. Ran tests; it failed with `404 Not Found`.
   - **Green**: Implemented `getDashboardSummaryService` utilizing parallel query execution to aggregate all totals and breakdowns. Verified that all 17 backend tests passed.

---

## 2. Key Architectural & Database Decisions

### A. Fixing Database Testing Race Conditions
* **The Problem**: During testing, we encountered a flaky assertion error (`expected 10001 to be 10000`) in our seeder test. This was caused by Vitest's default behavior of running test files in parallel. While the seeder test was verifying the 10,000-employee insert, other integration tests were concurrently wiping and seeding their own mock records into the same SQLite database file (`dev.db`).
* **The Solution**: Created [vitest.config.ts](file:///d:/Projects/SalaryAssesment/backend/vitest.config.ts) and set `fileParallelism: false`. This forces Vitest to run test files sequentially. Each integration test suite now has isolated, side-effect-free access to the SQLite file.

### B. Parallel Promise Query Performance
* **Decision**: Inside `getDashboardSummaryService`, we need to query multiple stats: active count, inactive count, active sum, and department groups. Instead of awaiting them sequentially (which blocks the Node event loop), we executed them concurrently using `Promise.all`:
  ```typescript
  const [totalActiveHeadcount, totalInactiveHeadcount, activeSalarySumResult, deptGroups] = await Promise.all([
    prisma.employee.count({ where: { isActive: true } }),
    prisma.employee.count({ where: { isActive: false } }),
    prisma.employee.aggregate({ ... }),
    prisma.employee.groupBy({ ... }),
  ]);
  ```
* **Rationale**: This triggers all SQLite queries concurrently, reducing database latency to a single round-trip and keeping the API response fast.

### C. Filtering out Inactive Employees
* **Decision**: Enforced `where: { isActive: true }` in all salary aggregates (min, max, average, sum).
* **Rationale**: HR metrics like average pay rates or department payroll sums should only reflect active personnel. Former employees (inactive status) are counted for historical records (headcount history) but excluded from active salary statistics.
