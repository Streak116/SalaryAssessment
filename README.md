# Salary Streak - Organisation Salary Assessment Tool

Salary Streak is a high-fidelity, end-to-end salary management and insights dashboard designed for HR Managers to handle organizational payroll and employee profiles.

---

## 1. Product Framing & UX Design

Designed specifically for the **HR Manager** persona, this tool addresses core workflows with premium details:
* **Dynamic Form Constraints**: When adding or editing an employee, dropdown options for **Job Title** automatically filter based on the chosen **Department** (Engineering titles, Finance titles, etc.), preserving data integrity.
* **Autocomplete & Search Selects**: Replaced standard selects and inputs with custom searchable combobox dropdowns for **Job Title**, **Department**, **Country**, and **Employment Type** to prevent spelling typos.
* **Persistent Drawer Context**: If saving an employee fails (due to a network glitch or validation error), the form remains open and pre-filled, preventing the user from losing their input progress.
* **Premium Aesthetics**: Built with custom HSL-based royal indigo color systems, dark/light mode toggles, interactive glassmorphic cards (`translate-y` hover translations), and animated loading skeleton states.

---

## 2. Technical Stack & Architecture

### Backend
* **Runtime & Framework**: Node.js, Express, TypeScript.
* **Database & ORM**: SQLite database managed via Prisma ORM for lightweight local execution and structured relational query capabilities.

### Frontend
* **Core & Layout**: Next.js (App Router, Turbopack) with custom CSS/Tailwind modules.
* **Icons & Visuals**: Lucide React.
* **State & Flow**: Context-based, promise-driven `DialogProvider` allowing any component to trigger blocking Info, Confirm, or Warning modals asynchronously (`const confirmed = await showDialog(...)`).

---

## 3. Database Seeding & Performance Considerations

* **Constraint**: Generate 10,000 unique records realistically combining names from `first_names.txt` and `last_names.txt` as fast as possible.
* **Implementation Details**:
  * Read files concurrently using Node `fs` promises.
  * Generate a randomized set of full names, cycling and mapping unique combinations to avoid collisions.
  * Execute database writes inside a single Prisma database transaction (`prisma.$transaction`) with bulk inserts rather than separate queries.
* **Result**: Inserts **10,000 records in ~500ms** (well below the 1-second benchmark). Failsafe seeder performance is verified via backend unit tests.

---

## 4. API Endpoints

### Employees
* `GET /api/employees` - Fetches a paginated, searchable (`?search=`), and filterable (`?department=`, `?country=`) list of employees.
* `GET /api/employees/:id` - Retrieves the latest database details of a single employee.
* `POST /api/employees` - Creates a new employee profile (validated via Zod schemas).
* `PUT /api/employees/:id` - Updates an existing employee profile.
* `DELETE /api/employees/:id` - Removes an employee from the system.

### Salary Insights
* `GET /api/insights/dashboard-summary` - Returns active headcount, total active payroll budget, global average payout, and department-specific averages.
* `GET /api/insights/country-stats` - Returns minimum, maximum, average salary, and employee count grouped by country.
* `GET /api/insights/job-title-stats?country=...` - Returns average salary and employee count grouped by job title for the selected country.

---

## 5. Testing Matrix

A suite of **73 fast, deterministic tests** covers the entire application structure:

### Backend Tests (19/19 Passed)
* **Seeder Performance Test**: Asserts seeder database writes complete in under 1 second.
* **Express Controllers & CRUD**: Verifies query params, payload schemas (Zod validation), pagination calculations, and database modifications.

### Frontend Tests (54/54 Passed)
* **Dialog Context Test**: Validates the Promise-based behavior of custom info, confirmation, and warning dialog overlays.
* **Employee Management Test**: Verifies list renders, pagination controls, search input triggers, drawer input validations, and error boundaries.
* **Dashboard Insights Test**: Asserts KPI widgets render summary calculations, charts reflect correct width percentages, and country dropdown selectors load new job title insights.

---

## 6. How to Run Locally

### Prerequisites
* Node.js v20.x or above

### Installation & Run
1. Install root dependencies (manages frontend and backend workspaces concurrently):
   ```bash
   npm install
   ```
2. Generate Prisma Client & Migrate Database:
   ```bash
   npm run db:generate -w backend
   npm run db:migrate -w backend
   ```
3. Seed 10,000 Employees:
   ```bash
   npm run db:seed
   ```
4. Run Development Servers (Backend on `http://localhost:3001` and Frontend on `http://localhost:3000`):
   ```bash
   npm run dev
   ```
5. Run Tests:
   * Backend: `npm run test:backend`
   * Frontend: `npm run test:frontend`

### Containerized Run (Docker Compose)
For instant deployment with zero local environment setup (automatically compiles source code, installs libraries, runs database migrations, and seeds the 10,000 employee records):
1. **Launch services**:
   ```bash
   docker compose up --build
   ```
2. **Access the application**:
   * Frontend Web App: `http://localhost:3000`
   * Backend Rest API: `http://localhost:3001`

---

## 7. Future Roadmap & Extension Scope

The following features represent high-impact next steps to scale the system's flexibility:
* **Interactive List Sorting**: Add sort controls to table column headers (`Name`, `Salary`, `Hire Date`) linked to backend query params (`sortBy`, `sortOrder`) for quick employee ranking.
* **Master Records Database Management**: Replace hardcoded frontend option lists with relational database tables for `Departments`, `JobTitles`, `Countries`, and `EmploymentTypes`. Provide an HR Admin "Masters Settings" dashboard to dynamically add, edit, or retire titles and departments via API routes.
* **Audit Trails & Security**: Add role-based authentication (RBAC) to control payroll view privileges, along with audit logs tracking historical changes to employee compensation cards.
* **PostgreSQL Database Migration**: Shift from lightweight SQLite to PostgreSQL for high-concurrency transactional support, multi-user writes, indexing optimizations, and simplified cloud deployment profiles.

