import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { 
  createPlanValidator,
  updatePlanValidator,
  updatePlanModulesValidator,
  createSubscriptionValidator,
  updateSubscriptionValidator,
  checkModuleAccessValidator,
  planIdValidator,
  restaurantIdValidator,
  subscriptionIdValidator
} from '../middleware/validators/subscription.validator';
import { protect as authenticate, authorize } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Plan Management Routes (Admin only)
router.post(
  '/plans',
  authorize('super_admin'),
  createPlanValidator,
  subscriptionController.createPlan
);

router.get(
  '/plans',
  subscriptionController.getPlans
);

router.get(
  '/plans/:id',
  subscriptionController.getPlan
);

router.put(
  '/plans/:id',
  authorize('super_admin'),
  updatePlanValidator,
  subscriptionController.updatePlan
);

router.delete(
  '/plans/:id',
  authorize('super_admin'),
  subscriptionController.deletePlan
);

// Plan Modules Management (Admin only)
router.get(
  '/plans/:planId/modules',
  planIdValidator,
  subscriptionController.getPlanModules
);

router.put(
  '/plans/:planId/modules',
  authorize('super_admin'),
  updatePlanModulesValidator,
  subscriptionController.updatePlanModules
);

// Subscription Management (Admin + Restaurant Admin)
router.post(
  '/subscriptions',
  authorize('super_admin', 'restaurant_admin'),
  createSubscriptionValidator,
  subscriptionController.createSubscription
);

router.get(
  '/restaurants/:restaurantId/subscription',
  restaurantIdValidator,
  subscriptionController.getRestaurantSubscription
);

router.put(
  '/subscriptions/:id',
  authorize('super_admin'),
  updateSubscriptionValidator,
  subscriptionController.updateSubscription
);

router.post(
  '/subscriptions/:id/cancel',
  authorize('super_admin'),
  subscriptionIdValidator,
  subscriptionController.cancelSubscription
);

// Utility Endpoints
router.get(
  '/restaurants/:restaurantId/modules',
  restaurantIdValidator,
  subscriptionController.getRestaurantModules
);

router.get(
  '/restaurants/:restaurantId/modules/:moduleName/check-access',
  checkModuleAccessValidator,
  subscriptionController.checkModuleAccess
);

router.get(
  '/modules',
  subscriptionController.getAvailableModules
);

export default router;
