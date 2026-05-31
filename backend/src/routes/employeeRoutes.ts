import { Router } from 'express';
import { createEmployee, getEmployees, updateEmployee, deleteEmployee, getEmployee } from '../controllers/employeeController.js';
import { validate } from '../middleware/validate.js';
import { employeeCreateSchema } from '../schemas/employeeSchema.js';

const router = Router();

router.get('/', getEmployees);
router.get('/:id', getEmployee);
router.post('/', validate(employeeCreateSchema), createEmployee);
router.put('/:id', validate(employeeCreateSchema), updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;
