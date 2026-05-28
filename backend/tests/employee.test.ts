import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/db/client.js';

describe('Employee API - Create', () => {
  beforeAll(async () => {
    await prisma.employee.deleteMany();
  });

  afterAll(async () => {
    await prisma.employee.deleteMany();
    await prisma.$disconnect();
  });

  it('should create a new employee with valid payload and return 201', async () => {
    const payload = {
      fullName: 'John Doe',
      jobTitle: 'Software Engineer',
      country: 'USA',
      salary: 95000,
      department: 'Engineering',
      email: 'john.doe.test@company.com',
      employmentType: 'Full-time',
      gender: 'Male',
    };

    const response = await request(app)
      .post('/api/employees')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.fullName).toBe(payload.fullName);
    expect(response.body.email).toBe(payload.email);
    expect(response.body.salary).toBe(payload.salary);

    const dbEmployee = await prisma.employee.findUnique({
      where: { email: payload.email },
    });
    expect(dbEmployee).not.toBeNull();
    expect(dbEmployee?.fullName).toBe(payload.fullName);
  });

  it.each([
    {
      description: 'invalid email and negative salary',
      payload: {
        fullName: 'John Doe',
        jobTitle: 'Software Engineer',
        country: 'USA',
        salary: -5000,
        department: 'Engineering',
        email: 'invalid-email',
        employmentType: 'Full-time',
        gender: 'Male',
      },
      expectedErrors: ['salary', 'email'],
    },
    {
      description: 'missing fields and invalid gender/employmentType',
      payload: {
        fullName: 'A',
        jobTitle: '',
        country: 'USA',
        salary: 10000,
        department: 'Engineering',
        email: 'test@company.com',
        employmentType: 'Freelancer',
        gender: 'Other',
      },
      expectedErrors: ['fullName', 'jobTitle', 'employmentType', 'gender'],
    },
    {
      description: 'missing required properties entirely',
      payload: {},
      expectedErrors: ['fullName', 'jobTitle', 'country', 'salary', 'department', 'email', 'employmentType', 'gender'],
    },
  ])('should return 400 Bad Request when payload has $description', async ({ payload, expectedErrors }) => {
    const response = await request(app)
      .post('/api/employees')
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(Array.isArray(response.body.errors)).toBe(true);

    const errorFields = response.body.errors.map((err: any) => err.path[0]);
    expectedErrors.forEach(field => {
      expect(errorFields).toContain(field);
    });
  });
});

describe('Employee API - List (GET)', () => {
  beforeAll(async () => {
    await prisma.employee.deleteMany();
    
    // Seed 5 specific employees for predictable search and filtering assertions
    await prisma.employee.createMany({
      data: [
        {
          fullName: 'Alice Smith',
          jobTitle: 'Software Engineer',
          country: 'USA',
          salary: 100000,
          department: 'Engineering',
          email: 'alice.smith@company.com',
          employmentType: 'Full-time',
          gender: 'Female',
          isActive: true,
          hireDate: new Date('2024-01-10'),
        },
        {
          fullName: 'Bob Jones',
          jobTitle: 'Software Engineer',
          country: 'UK',
          salary: 90000,
          department: 'Engineering',
          email: 'bob.jones@company.com',
          employmentType: 'Contractor',
          gender: 'Male',
          isActive: true,
          hireDate: new Date('2024-02-15'),
        },
        {
          fullName: 'Charlie Brown',
          jobTitle: 'Product Manager',
          country: 'USA',
          department: 'Product',
          salary: 120000,
          email: 'charlie.brown@company.com',
          employmentType: 'Full-time',
          gender: 'Non-binary',
          isActive: true,
          hireDate: new Date('2024-03-01'),
        },
        {
          fullName: 'Diana Prince',
          jobTitle: 'VP of Product',
          country: 'Germany',
          department: 'Product',
          salary: 180000,
          email: 'diana.prince@company.com',
          employmentType: 'Full-time',
          gender: 'Female',
          isActive: true,
          hireDate: new Date('2024-04-20'),
        },
        {
          fullName: 'Evan Wright',
          jobTitle: 'HR Specialist',
          country: 'India',
          department: 'HR',
          salary: 40000,
          email: 'evan.wright@company.com',
          employmentType: 'Part-time',
          gender: 'Male',
          isActive: false, // Inactive employee
          hireDate: new Date('2024-05-05'),
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.employee.deleteMany();
    await prisma.$disconnect();
  });

  it('should return paginated list of employees', async () => {
    const response = await request(app)
      .get('/api/employees?page=1&limit=2');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveLength(2);
    expect(response.body).toHaveProperty('pagination');
    expect(response.body.pagination).toEqual({
      total: 5,
      page: 1,
      limit: 2,
      totalPages: 3,
    });
  });

  it('should search employees by name, job title, or country', async () => {
    // Search by name
    const resName = await request(app).get('/api/employees?search=Smith');
    expect(resName.body.data).toHaveLength(1);
    expect(resName.body.data[0].fullName).toBe('Alice Smith');

    // Search by job title (returns two Software Engineers)
    const resTitle = await request(app).get('/api/employees?search=Software');
    expect(resTitle.body.data).toHaveLength(2);

    // Search by country (returns Germany)
    const resCountry = await request(app).get('/api/employees?search=Germany');
    expect(resCountry.body.data).toHaveLength(1);
    expect(resCountry.body.data[0].fullName).toBe('Diana Prince');
  });

  it('should filter employees by department', async () => {
    const response = await request(app).get('/api/employees?department=Product');
    expect(response.body.data).toHaveLength(2);
    const names = response.body.data.map((e: any) => e.fullName);
    expect(names).toContain('Charlie Brown');
    expect(names).toContain('Diana Prince');
  });

  it('should filter employees by country', async () => {
    const response = await request(app).get('/api/employees?country=USA');
    expect(response.body.data).toHaveLength(2);
    const names = response.body.data.map((e: any) => e.fullName);
    expect(names).toContain('Alice Smith');
    expect(names).toContain('Charlie Brown');
  });

  it('should support combining search and filters', async () => {
    const response = await request(app)
      .get('/api/employees?department=Engineering&search=Jones');
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].fullName).toBe('Bob Jones');
  });
});

describe('Employee API - Update (PUT)', () => {
  let employeeId: string;

  beforeAll(async () => {
    await prisma.employee.deleteMany();
    const employee = await prisma.employee.create({
      data: {
        fullName: 'Jane Doe',
        jobTitle: 'Software Engineer',
        country: 'USA',
        salary: 100000,
        department: 'Engineering',
        email: 'jane.doe@company.com',
        employmentType: 'Full-time',
        gender: 'Female',
        isActive: true,
        hireDate: new Date(),
      },
    });
    employeeId = employee.id;
  });

  afterAll(async () => {
    await prisma.employee.deleteMany();
    await prisma.$disconnect();
  });

  it('should update an existing employee and return 200', async () => {
    const updatedPayload = {
      fullName: 'Jane Doe',
      jobTitle: 'Senior Software Engineer',
      country: 'USA',
      salary: 120000,
      department: 'Engineering',
      email: 'jane.doe@company.com',
      employmentType: 'Full-time',
      gender: 'Female',
      isActive: true,
    };

    const response = await request(app)
      .put(`/api/employees/${employeeId}`)
      .send(updatedPayload);

    expect(response.status).toBe(200);
    expect(response.body.jobTitle).toBe(updatedPayload.jobTitle);
    expect(response.body.salary).toBe(updatedPayload.salary);

    const dbEmployee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });
    expect(dbEmployee?.jobTitle).toBe(updatedPayload.jobTitle);
    expect(dbEmployee?.salary).toBe(updatedPayload.salary);
  });
});

describe('Employee API - Delete (DELETE)', () => {
  let employeeId: string;

  beforeAll(async () => {
    await prisma.employee.deleteMany();
    const employee = await prisma.employee.create({
      data: {
        fullName: 'Jane Doe',
        jobTitle: 'Software Engineer',
        country: 'USA',
        salary: 100000,
        department: 'Engineering',
        email: 'jane.doe@company.com',
        employmentType: 'Full-time',
        gender: 'Female',
        isActive: true,
        hireDate: new Date(),
      },
    });
    employeeId = employee.id;
  });

  afterAll(async () => {
    await prisma.employee.deleteMany();
    await prisma.$disconnect();
  });

  it('should delete an existing employee and return 200', async () => {
    const response = await request(app)
      .delete(`/api/employees/${employeeId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Employee deleted successfully',
    });

    const dbEmployee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });
    expect(dbEmployee).toBeNull();
  });
});
