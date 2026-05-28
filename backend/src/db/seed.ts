import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedDatabase() {
  const firstNamesPath = path.resolve(__dirname, '../../../data/first_names.txt');
  const lastNamesPath = path.resolve(__dirname, '../../../data/last_names.txt');

  const firstNames = fs.readFileSync(firstNamesPath, 'utf-8')
    .split('\n')
    .map(name => name.trim())
    .filter(name => name.length > 0);

  const lastNames = fs.readFileSync(lastNamesPath, 'utf-8')
    .split('\n')
    .map(name => name.trim())
    .filter(name => name.length > 0);

  if (firstNames.length === 0 || lastNames.length === 0) {
    throw new Error('First names or last names files are empty.');
  }

  // Predefined lists for realistic data generation
  const countries = ['USA', 'UK', 'Germany', 'Canada', 'India', 'Australia', 'France', 'Japan', 'Singapore', 'Brazil'];
  const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Legal', 'Customer Success'];
  
  const jobTitlesMap: Record<string, string[]> = {
    Engineering: ['Software Engineer', 'Senior Software Engineer', 'Engineering Manager', 'QA Engineer', 'DevOps Engineer'],
    Product: ['Product Manager', 'Senior Product Manager', 'VP of Product'],
    Design: ['UI/UX Designer', 'Senior Designer', 'Art Director'],
    Marketing: ['Marketing Specialist', 'Growth Marketer', 'Marketing Director'],
    Sales: ['Account Executive', 'Sales Representative', 'Sales Director'],
    HR: ['HR Specialist', 'HR Manager', 'VP of HR'],
    Finance: ['Accountant', 'Financial Analyst', 'CFO'],
    Operations: ['Operations Coordinator', 'Operations Manager', 'COO'],
    Legal: ['Legal Counsel', 'General Counsel'],
    'Customer Success': ['Success Specialist', 'Success Manager']
  };

  const employmentTypes = ['Full-time', 'Part-time', 'Contractor', 'Intern'];
  const genders = ['Male', 'Female', 'Non-binary'];

  // Base salaries by country (multiplier to adjust ranges realistically)
  const countrySalaryMultiplier: Record<string, number> = {
    USA: 1.2,
    UK: 1.0,
    Germany: 1.05,
    Canada: 0.95,
    India: 0.35,
    Australia: 1.1,
    France: 0.9,
    Japan: 0.85,
    Singapore: 1.15,
    Brazil: 0.4
  };

  // Base salaries by job title
  const baseSalaryMap: Record<string, number> = {
    'Software Engineer': 85000,
    'Senior Software Engineer': 130000,
    'Engineering Manager': 160000,
    'QA Engineer': 70000,
    'DevOps Engineer': 95000,
    'Product Manager': 90000,
    'Senior Product Manager': 135000,
    'VP of Product': 180000,
    'UI/UX Designer': 75000,
    'Senior Designer': 110000,
    'Art Director': 130000,
    'Marketing Specialist': 55000,
    'Growth Marketer': 65000,
    'Marketing Director': 110000,
    'Account Executive': 70000,
    'Sales Representative': 50000,
    'Sales Director': 120000,
    'HR Specialist': 55000,
    'HR Manager': 85000,
    'VP of HR': 140000,
    Accountant: 60000,
    'Financial Analyst': 75000,
    CFO: 190000,
    'Operations Coordinator': 50000,
    'Operations Manager': 80000,
    COO: 190000,
    'Legal Counsel': 95000,
    'General Counsel': 170000,
    'Success Specialist': 50000,
    'Success Manager': 75000
  };

  const employeesToInsert = [];
  let nameIndex = 0;

  // We need exactly 10,000 employees. We will loop 10,000 times,
  // generating combinations of first and last names.
  for (let i = 0; i < 10000; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const fullName = `${firstName} ${lastName}`;
    
    // Determine details
    const country = countries[i % countries.length];
    const department = departments[i % departments.length];
    const titles = jobTitlesMap[department];
    const jobTitle = titles[i % titles.length];
    
    const baseSal = baseSalaryMap[jobTitle] || 60000;
    const countryMultiplier = countrySalaryMultiplier[country];
    // Add some random variation (-10% to +10%)
    const variation = 0.9 + Math.random() * 0.2;
    const salary = Math.round(baseSal * countryMultiplier * variation * 100) / 100;
    
    const employmentType = employmentTypes[i % employmentTypes.length];
    const gender = genders[i % genders.length];
    const isActive = Math.random() > 0.05; // 95% active
    
    // Hire date in the last 8 years
    const hireDate = new Date();
    hireDate.setFullYear(hireDate.getFullYear() - (i % 8));
    hireDate.setMonth(i % 12);
    hireDate.setDate((i % 28) + 1);

    // Make unique email by appending index
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@company.com`;

    employeesToInsert.push({
      fullName,
      jobTitle,
      country,
      salary,
      department,
      hireDate,
      email,
      employmentType,
      gender,
      isActive
    });
  }

  // Clear existing records and insert in bulk inside a single transaction
  await prisma.employee.deleteMany();
  await prisma.employee.createMany({
    data: employeesToInsert
  });
}

// Support running the script directly
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  console.log('Seeding database with 10,000 employees...');
  const start = performance.now();
  seedDatabase()
    .then(async () => {
      const duration = performance.now() - start;
      console.log(`Seeding completed successfully in ${duration.toFixed(2)}ms.`);
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error('Error seeding database:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
