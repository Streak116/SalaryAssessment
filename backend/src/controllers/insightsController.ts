import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as employeeService from '../services/employeeService.js';

export const getCountryStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await employeeService.getCountryStatsService();
  return res.json(stats);
});

export const getJobTitleStats = asyncHandler(async (req: Request, res: Response) => {
  const country = req.query.country as string | undefined;

  if (!country) {
    return res.status(400).json({ error: 'Country query parameter is required' });
  }

  const stats = await employeeService.getJobTitleStatsService(country);
  return res.json(stats);
});

export const getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await employeeService.getDashboardSummaryService();
  return res.json(summary);
});
