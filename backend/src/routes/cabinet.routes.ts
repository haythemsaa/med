import { Router } from 'express';
import cabinetController from '../controllers/cabinet.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Super Admin only routes
router.post('/', authorize('SUPER_ADMIN'), cabinetController.create);
router.get('/', authorize('SUPER_ADMIN'), cabinetController.findAll);
router.put('/:id/subscription', authorize('SUPER_ADMIN'), cabinetController.updateSubscription);
router.put('/:id/suspend', authorize('SUPER_ADMIN'), cabinetController.suspend);
router.put('/:id/activate', authorize('SUPER_ADMIN'), cabinetController.activate);
router.delete('/:id', authorize('SUPER_ADMIN'), cabinetController.delete);

// Cabinet admin can view/update their own cabinet
router.get('/:id', authorize('SUPER_ADMIN', 'ADMIN_CABINET'), cabinetController.findById);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN_CABINET'), cabinetController.update);
router.get('/:id/stats', authorize('SUPER_ADMIN', 'ADMIN_CABINET'), cabinetController.getStats);

export default router;
