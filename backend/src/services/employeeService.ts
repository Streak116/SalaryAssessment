import { prisma } from '../db/client.js';
import { EmployeeCreateInput } from '../schemas/employeeSchema.js';

export async function createEmployeeService(data: EmployeeCreateInput) {
  return prisma.employee.create({
    data: {
      ...data,
      hireDate: new Date(),
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
  return prisma.employee.update({
    where: { id },
    data,
  });
}

export async function deleteEmployeeService(id: string) {
  return prisma.employee.delete({
    where: { id },
  });
}

export async function getCountryStatsService() {
  const stats = await prisma.employee.groupBy({
    by: ['country'],
    where: {
      isActive: true,
    },
    _min: {
      salary: true,
    },
    _max: {
      salary: true,
    },
    _avg: {
      salary: true,
    },
    _count: {
      id: true,
    },
  });

  return stats.map(s => ({
    country: s.country,
    minSalary: s._min.salary,
    maxSalary: s._max.salary,
    avgSalary: s._avg.salary ? Math.round(s._avg.salary * 100) / 100 : 0,
    count: s._count.id,
  }));
}

export async function getJobTitleStatsService(country: string) {
  const stats = await prisma.employee.groupBy({
    by: ['jobTitle'],
    where: {
      country,
      isActive: true,
    },
    _avg: {
      salary: true,
    },
    _count: {
      id: true,
    },
  });

  return stats.map(s => ({
    jobTitle: s.jobTitle,
    avgSalary: s._avg.salary ? Math.round(s._avg.salary * 100) / 100 : 0,
    count: s._count.id,
  }));
}

export async function getDashboardSummaryService() {
  const [totalActiveHeadcount, totalInactiveHeadcount, activeSalarySumResult, deptGroups] = await Promise.all([
    prisma.employee.count({ where: { isActive: true } }),
    prisma.employee.count({ where: { isActive: false } }),
    prisma.employee.aggregate({
      _sum: {
        salary: true,
      },
      where: {
        isActive: true,
      },
    }),
    prisma.employee.groupBy({
      by: ['department'],
      where: {
        isActive: true,
      },
      _avg: {
        salary: true,
      },
      _count: {
        id: true,
      },
    }),
  ]);

  const totalActivePayroll = activeSalarySumResult._sum.salary || 0;
  const globalAverageSalary = totalActiveHeadcount > 0 
    ? Math.round((totalActivePayroll / totalActiveHeadcount) * 100) / 100 
    : 0;

  const departmentStats = deptGroups.map(d => ({
    department: d.department,
    avgSalary: d._avg.salary ? Math.round(d._avg.salary * 100) / 100 : 0,
    count: d._count.id,
  }));

  return {
    totalActiveHeadcount,
    totalInactiveHeadcount,
    totalActivePayroll,
    globalAverageSalary,
    departmentStats,
  };
}
