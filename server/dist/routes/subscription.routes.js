"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscription_controller_1 = require("../controllers/subscription.controller");
const subscription_validator_1 = require("../middleware/validators/subscription.validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply authentication to all routes
router.use(auth_1.protect);
// Plan Management Routes (Admin only)
router.post('/plans', (0, auth_1.authorize)('super_admin'), subscription_validator_1.createPlanValidator, subscription_controller_1.subscriptionController.createPlan);
router.get('/plans', subscription_controller_1.subscriptionController.getPlans);
router.get('/plans/:id', subscription_controller_1.subscriptionController.getPlan);
router.put('/plans/:id', (0, auth_1.authorize)('super_admin'), subscription_validator_1.updatePlanValidator, subscription_controller_1.subscriptionController.updatePlan);
router.delete('/plans/:id', (0, auth_1.authorize)('super_admin'), subscription_controller_1.subscriptionController.deletePlan);
// Plan Modules Management (Admin only)
router.get('/plans/:planId/modules', subscription_validator_1.planIdValidator, subscription_controller_1.subscriptionController.getPlanModules);
router.put('/plans/:planId/modules', (0, auth_1.authorize)('super_admin'), subscription_validator_1.updatePlanModulesValidator, subscription_controller_1.subscriptionController.updatePlanModules);
// Subscription Management (Admin + Restaurant Admin)
router.post('/subscriptions', (0, auth_1.authorize)('super_admin', 'restaurant_admin'), subscription_validator_1.createSubscriptionValidator, subscription_controller_1.subscriptionController.createSubscription);
router.get('/restaurants/:restaurantId/subscription', subscription_validator_1.restaurantIdValidator, subscription_controller_1.subscriptionController.getRestaurantSubscription);
router.put('/subscriptions/:id', (0, auth_1.authorize)('super_admin'), subscription_validator_1.updateSubscriptionValidator, subscription_controller_1.subscriptionController.updateSubscription);
router.post('/subscriptions/:id/cancel', (0, auth_1.authorize)('super_admin'), subscription_validator_1.subscriptionIdValidator, subscription_controller_1.subscriptionController.cancelSubscription);
// Utility Endpoints
router.get('/restaurants/:restaurantId/modules', subscription_validator_1.restaurantIdValidator, subscription_controller_1.subscriptionController.getRestaurantModules);
router.get('/restaurants/:restaurantId/modules/:moduleName/check-access', subscription_validator_1.checkModuleAccessValidator, subscription_controller_1.subscriptionController.checkModuleAccess);
router.get('/modules', subscription_controller_1.subscriptionController.getAvailableModules);
exports.default = router;
