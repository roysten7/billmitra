import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurant.controller';
import { protect, authorize } from '../middleware/auth';
import { 
  createRestaurantValidation, 
  updateRestaurantValidation,
  createSubscriptionPlanValidation,
  createRestaurantSubscriptionValidation,
  createRestaurantAdminValidation,
  validate
} from '../validators/restaurant.validator';

const router = Router();

// Apply authentication middleware to all routes
router.use(protect);

// Restaurant Routes
router.post(
  '/restaurants',
  authorize('super_admin'),
  validate(createRestaurantValidation),
  RestaurantController.createRestaurant
);

router.post(
  '/restaurants/with-subscription',
  authorize('super_admin'),
  RestaurantController.createRestaurantWithSubscription
);

router.get(
  '/restaurants',
  authorize('super_admin'),
  RestaurantController.listRestaurants
);

router.get(
  '/restaurants/:id',
  authorize('super_admin'),
  RestaurantController.getRestaurant
);

router.put(
  '/restaurants/:id',
  authorize('super_admin'),
  validate(updateRestaurantValidation),
  RestaurantController.updateRestaurant
);

router.delete(
  '/restaurants/:id',
  authorize('super_admin'),
  RestaurantController.deleteRestaurant
);

router.post(
  '/restaurants/:id/reset-admin-password',
  authorize('super_admin'),
  RestaurantController.resetRestaurantAdminPassword
);

router.put(
  '/restaurants/:id/admin',
  authorize('super_admin'),
  RestaurantController.updateRestaurantAdmin
);

router.get(
  '/restaurants/:id/settings',
  authorize('super_admin', 'restaurant_admin'),
  RestaurantController.getRestaurantSettings
);

router.put(
  '/restaurants/:id/settings',
  authorize('super_admin'),
  RestaurantController.updateRestaurantSettings
);

router.put(
  '/restaurants/:id/subscription',
  authorize('super_admin'),
  RestaurantController.updateRestaurantSubscription
);

// Subscription Plan Routes
router.post(
  '/subscription-plans',
  authorize('super_admin'),
  validate(createSubscriptionPlanValidation),
  RestaurantController.createSubscriptionPlan
);

router.get(
  '/subscription-plans',
  RestaurantController.listSubscriptionPlans
);

router.get(
  '/subscription-plans/:id',
  RestaurantController.getSubscriptionPlan
);

// Restaurant Subscription Routes
router.post(
  '/restaurant-subscriptions',
  authorize('super_admin'),
  validate(createRestaurantSubscriptionValidation),
  RestaurantController.createRestaurantSubscription
);

router.get(
  '/restaurants/:restaurantId/subscription',
  authorize('super_admin'),
  RestaurantController.getRestaurantSubscription
);

// Restaurant Admin Routes
router.post(
  '/restaurant-admins',
  authorize('super_admin'),
  validate(createRestaurantAdminValidation),
  RestaurantController.createRestaurantAdmin
);

// Dashboard/Stats
router.get(
  '/restaurants/stats',
  authorize('super_admin'),
  RestaurantController.getRestaurantStats
);

export default router;
