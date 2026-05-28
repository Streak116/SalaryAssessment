# Step 3 Approach: Employee CRUD & Architectural Refactoring

This document outlines the development approach, design decisions, and architectural patterns applied during the implementation of the Employee CRUD endpoints.

---

## 1. Test-Driven Development (TDD) Workflow
We followed a strict **Red-Green-Refactor** development cycle, building out each CRUD feature incrementally. The exact sequence of steps followed was:

1. **Employee Creation Success**:
   - **Red**: Wrote a test verifying that sending a valid employee payload to `POST /api/employees` saves the record and returns a `201` status code. Ran tests; it failed with `404 Not Found`.
   - **Green**: Implemented a basic `POST` route and inline controller handler mapping values to Prisma. Verified the test passed.

2. **POST Validation Failures**:
   - **Red**: Wrote a parameterized test suite checking multiple invalid payload scenarios (negative salaries, incorrect email formats, too-short names, invalid genders, and empty bodies). Ran tests; they failed because the backend accepted all input.
   - **Green**: Created a type-safe Zod schema (`employeeSchema.ts`) and custom validation middleware (`validate.ts`) to intercept payloads at the route entry point. Verified the tests passed with `400 Bad Request` and structured validation errors.

3. **GET Pagination, Search & Filters**:
   - **Red**: Wrote tests asserting that `GET /api/employees` successfully paginates records, performs fuzzy searching (name, title, country), and filters by department and country. Ran tests; they failed with `404 Not Found` (endpoint unregistered).
   - **Green**: Implemented the query parameter extraction, calculated database paging offsets, and wrote the matching Prisma filter queries in the controller. Verified the list and search tests passed.

4. **PUT Update Success**:
   - **Red**: Wrote a test asserting that `PUT /api/employees/:id` successfully updates fields (like promoting a title and raising a salary) and returns a `200` status code. Ran tests; it failed with `404 Not Found`.
   - **Green**: Implemented the check for database employee existence and the Prisma update query. Verified the test passed.

5. **DELETE Success**:
   - **Red**: Wrote a test asserting that `DELETE /api/employees/:id` removes the employee and returns a `200` status code. Ran tests; it failed with `404 Not Found`.
   - **Green**: Implemented the existence check and deletion query. Verified the entire CRUD test suite was passing.

6. **Refactor Phase (Architectural Optimization)**:
   - Once all CRUD features were verified working, we performed a structural refactor:
     - Separated the Express application logic (`app.ts`) from the network port listener (`index.ts`) to prevent port conflicts in testing.
     - Extracted all raw database logic from the controllers into a dedicated **Service Layer** (`employeeService.ts`).
     - Standardized error processing by creating a **Global Error Handler** and an `asyncHandler` decorator utility, eliminating copy-paste `try/catch` boilerplate in controllers.
   - Ran our test suite again to confirm the refactored project structure remained **100% green** with no regressions.

---

## 2. Architectural Design Decisions

### A. Separation of App and Server Port Binding
* **Decision**: Split the application logic (`backend/src/app.ts`) from the network listener (`backend/src/index.ts`).
* **Rationale**: When running integration tests, `supertest` starts the Express application in memory without opening a physical TCP port. Keeping them separate prevents "EADDRINUSE" (port already in use) errors when running test suites concurrently alongside a running development server.

### B. Service Layer Extraction (Separation of Concerns)
* **Decision**: Extracted all Prisma ORM queries from controllers into `backend/src/services/employeeService.ts`.
* **Rationale**: Controllers should only handle HTTP concerns (extracting query/body params, sending status codes, and returning JSON). Database operations and business rules belong in the service layer. This separation makes the database logic reusable (e.g., for CLI commands, seeders, or cron jobs) and easier to unit-test in isolation.

### C. Zod-Powered Validation Middleware
* **Decision**: Created a reusable `validate` middleware using Zod schemas (`backend/src/schemas/employeeSchema.ts`).
* **Rationale**: Enforcing validation at the route-entry point ensures that incorrect data (e.g., negative salaries, invalid emails, malformed enums) is caught immediately. Validated payloads are typed and safely passed to controllers.

### D. Centralized Error Handling & Async Wrapper
* **Decision**: Built a global `errorHandler` middleware and an `asyncHandler` decorator utility.
* **Rationale**:
  - **`asyncHandler`**: Standard Express does not catch errors thrown in asynchronous middleware automatically. Wrapping controller functions in `asyncHandler` forwards exceptions to the next handler without cluttering controllers with duplicate `try/catch` boilerplate.
  - **`errorHandler`**: Centralizes error formatting. It translates database-specific errors (like Prisma's `P2002` duplicate email constraint) and validation errors (Zod errors) into user-friendly JSON payloads with appropriate HTTP status codes (`400`, `404`, `500`).

---

## 3. Project Structure Post-Refactor
```text
backend/src/
├── controllers/          # HTTP request handlers (thin controllers)
│   └── employeeController.ts
├── db/                   # Database client configurations
│   ├── client.ts
│   └── seed.ts
├── middleware/           # Reusable middleware
│   ├── errorHandler.ts   # Centralized error responses
│   └── validate.ts       # Input schema validation
├── routes/               # Express endpoint routes mapping
│   └── employeeRoutes.ts
├── schemas/              # Zod validation schemas
│   └── employeeSchema.ts
├── services/             # Prisma database operations (business logic)
│   └── employeeService.ts
├── utils/                # General utility functions
│   └── asyncHandler.ts   # Async route wrapper
├── app.ts                # Express app setup & configurations
└── index.ts              # Server startup execution
```
