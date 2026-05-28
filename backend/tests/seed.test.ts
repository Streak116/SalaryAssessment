import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/db/client.js';
import { seedDatabase } from '../src/db/seed.js';

describe('Database Seeding', () => {
  beforeAll(async () => {
    await prisma.employee.deleteMany();
  });

  afterAll(async () => {
    await prisma.employee.deleteMany();
    await prisma.$disconnect();
  });

  it('should seed exactly 10,000 employees in under 1 second', async () => {
    const startTime = performance.now();
    
    await seedDatabase();
    
    const endTime = performance.now();
    const duration = endTime - startTime;

    const count = await prisma.employee.count();
    expect(count).toBe(10000);

    console.log(`Seeding execution time: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(1000);
  });
});
