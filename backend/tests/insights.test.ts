import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/db/client.js';

describe('Insights API', () => {
  beforeAll(async () => {
    await prisma.employee.deleteMany();

    // Seed mock data with specific countries, departments, job titles, and salaries
    await prisma.employee.createMany({
      data: [
        {
          fullName: 'Alice USA',
          jobTitle: 'Software Engineer',
          country: 'USA',
          salary: 100000,
          department: 'Engineering',
          email: 'alice.usa@company.com',
          employmentType: 'Full-time',
          gender: 'Female',
          isActive: true,
          hireDate: new Date(),
        },
        {
          fullName: 'Bob USA',
          jobTitle: 'Product Manager',
          country: 'USA',
          salary: 150000,
          department: 'Product',
          email: 'bob.usa@company.com',
          employmentType: 'Full-time',
          gender: 'Male',
          isActive: true,
          hireDate: new Date(),
        },
        {
          fullName: 'Charlie UK',
          jobTitle: 'Software Engineer',
          country: 'UK',
          salary: 80000,
          department: 'Engineering',
          email: 'charlie.uk@company.com',
          employmentType: 'Full-time',
          gender: 'Male',
          isActive: true,
          hireDate: new Date(),
        },
        {
          fullName: 'Diana UK',
          jobTitle: 'UX Designer',
          country: 'UK',
          salary: 120000,
          department: 'Design',
          email: 'diana.uk@company.com',
          employmentType: 'Full-time',
          gender: 'Female',
          isActive: true,
          hireDate: new Date(),
        },
        {
          fullName: 'Evan Germany',
          jobTitle: 'Software Engineer',
          country: 'Germany',
          salary: 90000,
          department: 'Engineering',
          email: 'evan.germany@company.com',
          employmentType: 'Full-time',
          gender: 'Male',
          isActive: true,
          hireDate: new Date(),
        },
        {
          fullName: 'Fiona Inactive',
          jobTitle: 'Product Manager',
          country: 'Germany',
          department: 'Product',
          salary: 100000,
          email: 'fiona.inactive@company.com',
          employmentType: 'Full-time',
          gender: 'Female',
          isActive: false, // Inactive employee
          hireDate: new Date(),
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.employee.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /api/insights/country-stats', () => {
    it('should return correct min, max, average salary and count for each country', async () => {
      const response = await request(app)
        .get('/api/insights/country-stats');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(3); // Inactive employee (Fiona) should be excluded

      // Find USA stats
      const usaStats = response.body.find((s: any) => s.country === 'USA');
      expect(usaStats).toBeDefined();
      expect(usaStats.count).toBe(2);
      expect(usaStats.minSalary).toBe(100000);
      expect(usaStats.maxSalary).toBe(150000);
      expect(usaStats.avgSalary).toBe(125000);

      // Find UK stats
      const ukStats = response.body.find((s: any) => s.country === 'UK');
      expect(ukStats).toBeDefined();
      expect(ukStats.count).toBe(2);
      expect(ukStats.minSalary).toBe(80000);
      expect(ukStats.maxSalary).toBe(120000);
      expect(ukStats.avgSalary).toBe(100000);

      // Find Germany stats
      const germanyStats = response.body.find((s: any) => s.country === 'Germany');
      expect(germanyStats).toBeDefined();
      expect(germanyStats.count).toBe(1);
      expect(germanyStats.minSalary).toBe(90000);
      expect(germanyStats.maxSalary).toBe(90000);
      expect(germanyStats.avgSalary).toBe(90000);
    });
  });

  describe('GET /api/insights/job-title-stats', () => {
    it('should return 400 Bad Request if country is missing', async () => {
      const response = await request(app)
        .get('/api/insights/job-title-stats');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Country query parameter is required');
    });

    it('should return average salary and count for each job title in USA', async () => {
      const response = await request(app)
        .get('/api/insights/job-title-stats?country=USA');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);

      const engineerStats = response.body.find((s: any) => s.jobTitle === 'Software Engineer');
      expect(engineerStats).toBeDefined();
      expect(engineerStats.avgSalary).toBe(100000);
      expect(engineerStats.count).toBe(1);

      const pmStats = response.body.find((s: any) => s.jobTitle === 'Product Manager');
      expect(pmStats).toBeDefined();
      expect(pmStats.avgSalary).toBe(150000);
      expect(pmStats.count).toBe(1);
    });
  });

  describe('GET /api/insights/dashboard-summary', () => {
    it('should return high-level dashboard summaries', async () => {
      const response = await request(app)
        .get('/api/insights/dashboard-summary');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalActiveHeadcount');
      expect(response.body.totalActiveHeadcount).toBe(5);

      expect(response.body).toHaveProperty('totalInactiveHeadcount');
      expect(response.body.totalInactiveHeadcount).toBe(1);

      expect(response.body).toHaveProperty('totalActivePayroll');
      expect(response.body.totalActivePayroll).toBe(540000); // 100k + 150k + 80k + 120k + 90k

      expect(response.body).toHaveProperty('globalAverageSalary');
      expect(response.body.globalAverageSalary).toBe(108000); // 540k / 5

      expect(response.body).toHaveProperty('departmentStats');
      expect(Array.isArray(response.body.departmentStats)).toBe(true);
      
      const engStats = response.body.departmentStats.find((d: any) => d.department === 'Engineering');
      expect(engStats).toBeDefined();
      expect(engStats.count).toBe(3);
      expect(engStats.avgSalary).toBe(90000); // (100k + 80k + 90k) / 3
    });
  });
});
