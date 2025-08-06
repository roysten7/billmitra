import { Router } from 'express';
import { ModuleController } from '../controllers/module.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(protect);

// Module Management Routes (Super Admin Only)
router.post(
  '/',
  authorize('super_admin'),
  ModuleController.createModule
);

router.get(
  '/',
  authorize('super_admin'),
  ModuleController.listModules
);

router.get(
  '/:id',
  authorize('super_admin'),
  ModuleController.getModule
);

router.put(
  '/:id',
  authorize('super_admin'),
  ModuleController.updateModule
);

router.delete(
  '/:id',
  authorize('super_admin'),
  ModuleController.deleteModule
);

// Restaurant Settings Routes
router.get(
  '/restaurants/:restaurantId/settings',
  authorize('super_admin'),
  ModuleController.getRestaurantSettings
);

router.put(
  '/restaurants/:restaurantId/settings',
  authorize('super_admin'),
  ModuleController.updateRestaurantSettings
);

// Restaurant Module Permissions Routes
router.get(
  '/restaurants/:restaurantId/module-permissions',
  authorize('super_admin'),
  ModuleController.getRestaurantModulePermissions
);

router.put(
  '/restaurants/:restaurantId/module-permissions',
  authorize('super_admin'),
  ModuleController.updateRestaurantModulePermissions
);

// Combined restaurant details
router.get(
  '/restaurants/:restaurantId/details',
  authorize('super_admin'),
  ModuleController.getRestaurantWithDetails
);

export default router; 