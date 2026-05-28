import { prisma } from '../db/client.js';

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
