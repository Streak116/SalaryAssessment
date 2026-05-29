import { z } from 'zod';

export const employeeCreateSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  jobTitle: z.string().min(1, 'Job title is required'),
  country: z.string().min(1, 'Country is required'),
  salary: z.number().positive('Salary must be a positive number'),
  department: z.string().min(1, 'Department is required'),
  email: z.string().email('Invalid email address'),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contractor', 'Intern'], {
    errorMap: () => ({ message: 'Employment type must be Full-time, Part-time, Contractor, or Intern' }),
  }),
  gender: z.enum(['Male', 'Female', 'Non-binary'], {
    errorMap: () => ({ message: 'Gender must be Male, Female, or Non-binary' }),
  }),
  isActive: z.boolean().optional(),
  hireDate: z.string().optional(),
});

export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
