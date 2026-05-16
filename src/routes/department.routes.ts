import { Router } from 'express';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../controllers/department.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();

router.get('/', getDepartments);
router.post('/', authMiddleware, roleMiddleware(['super_admin']), createDepartment);
router.put('/:id', authMiddleware, roleMiddleware(['super_admin']), updateDepartment);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin']), deleteDepartment);

export default router;
