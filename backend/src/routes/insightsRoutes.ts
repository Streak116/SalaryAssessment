import { Router } from 'express';
import { getCountryStats, getJobTitleStats, getDashboardSummary } from '../controllers/insightsController.js';

const router = Router();

router.get('/country-stats', getCountryStats);
router.get('/job-title-stats', getJobTitleStats);
router.get('/dashboard-summary', getDashboardSummary);

export default router;
