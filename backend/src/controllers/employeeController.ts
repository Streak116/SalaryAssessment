import { Request, Response } from 'express';
import { prisma } from '../db/client.js';

export async function createEmployee(req: Request, res: Response) {
  try {
    const { fullName, jobTitle, country, salary, department, email, employmentType, gender, isActive } = req.body;

    if (!fullName || !jobTitle || !country || !salary || !department || !email || !employmentType || !gender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const employee = await prisma.employee.create({
      data: {
        fullName,
        jobTitle,
        country,
        salary: Number(salary),
        department,
        email,
        employmentType,
        gender,
        isActive: isActive ?? true,
        hireDate: new Date(),
      },
    });

    return res.status(201).json(employee);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Error creating employee:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getEmployees(req: Request, res: Response) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 20);
    const search = req.query.search as string | undefined;
    const department = req.query.department as string | undefined;
    const country = req.query.country as string | undefined;

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

    return res.json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function updateEmployee(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { fullName, jobTitle, country, salary, department, email, employmentType, gender, isActive } = req.body;

    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        fullName,
        jobTitle,
        country,
        salary: Number(salary),
        department,
        email,
        employmentType,
        gender,
        isActive: isActive ?? existingEmployee.isActive,
      },
    });

    return res.json(updatedEmployee);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Error updating employee:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function deleteEmployee(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await prisma.employee.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
