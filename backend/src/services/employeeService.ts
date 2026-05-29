import { prisma } from '../db/client.js';
import { EmployeeCreateInput } from '../schemas/employeeSchema.js';

export async function createEmployeeService(data: EmployeeCreateInput) {
  const { hireDate, ...rest } = data;
  return prisma.employee.create({
    data: {
      ...rest,
      hireDate: hireDate ? new Date(hireDate) : new Date(),
    },
  });
}

export async function getEmployeesService(params: {
  page: number;
  limit: number;
  search?: string;
  department?: string;
  country?: string;
}) {
  const { page, limit, search, department, country } = params;
  const skip = (page - 1) * limit;
  const take = limit;

  const where: any = {};

  if (department) {
    where.department = department;
  }

  if (country) {
    where.country = country;
  }

  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { jobTitle: { contains: search } },
      { country: { contains: search } },
    ];
  }

  const [total, data] = await Promise.all([
    prisma.employee.count({ where }),
    prisma.employee.findMany({
      where,
      skip,
      take,
      orderBy: { hireDate: 'desc' },
    }),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getEmployeeByIdService(id: string) {
  return prisma.employee.findUnique({
    where: { id },
  });
}

export async function updateEmployeeService(id: string, data: Partial<EmployeeCreateInput>) {
  const { hireDate, ...rest } = data;
  const updateData: any = { ...rest };
  if (hireDate !== undefined) {
    updateData.hireDate = hireDate ? new Date(hireDate) : null;
  }
  return prisma.employee.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteEmployeeService(id: string) {
  return prisma.employee.delete({
    where: { id },
  });
}
