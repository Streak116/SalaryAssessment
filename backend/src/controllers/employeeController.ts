import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as employeeService from '../services/employeeService.js';

export const createEmployee = asyncHandler(async (req: Request, res: Response) => {
  const employee = await employeeService.createEmployeeService(req.body);
  return res.status(201).json(employee);
});

export const getEmployees = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 20);
  const search = req.query.search as string | undefined;
  const department = req.query.department as string | undefined;
  const country = req.query.country as string | undefined;

  const result = await employeeService.getEmployeesService({
    page,
    limit,
    search,
    department,
    country,
  });

  return res.json(result);
});

export const updateEmployee = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingEmployee = await employeeService.getEmployeeByIdService(id);
  if (!existingEmployee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const updatedEmployee = await employeeService.updateEmployeeService(id, req.body);
  return res.json(updatedEmployee);
});

export const deleteEmployee = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingEmployee = await employeeService.getEmployeeByIdService(id);
  if (!existingEmployee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  await employeeService.deleteEmployeeService(id);

  return res.json({
    success: true,
    message: 'Employee deleted successfully',
  });
});
