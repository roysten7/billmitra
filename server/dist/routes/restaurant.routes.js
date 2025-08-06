"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const restaurant_controller_1 = require("../controllers/restaurant.controller");
const auth_1 = require("../middleware/auth");
const restaurant_validator_1 = require("../validators/restaurant.validator");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_1.protect);
// Restaurant Routes
router.post('/restaurants', (0, auth_1.authorize)('super_admin'), (0, restaurant_validator_1.validate)(restaurant_validator_1.createRestaurantValidation), restaurant_controller_1.RestaurantController.createRestaurant);
router.post('/restaurants/with-subscription', (0, auth_1.authorize)('super_admin'), restaurant_controller_1.RestaurantController.createRestaurantWithSubscription);
router.get('/restaurants', (0, auth_1.authorize)('super_admin'), restaurant_controller_1.RestaurantController.listRestaurants);
router.get('/restaurants/:id', (0, auth_1.authorize)('super_admin'), restaurant_controller_1.RestaurantController.getRestaurant);
router.put('/restaurants/:id', (0, auth_1.authorize)('super_admin'), (0, restaurant_validator_1.validate)(restaurant_validator_1.updateRestaurantValidation), restaurant_controller_1.RestaurantController.updateRestaurant);
router.delete('/restaurants/:id', (0, auth_1.authorize)('super_admin'), restaurant_controller_1.RestaurantController.deleteRestaurant);
router.post('/restaurants/:id/reset-admin-password', (0, auth_1.authorize)('super_admin'), restaurant_controller_1.RestaurantController.resetRestaurantAdminPassword);
router.put('/restaurants/:id/admin', (0, auth_1.authorize)('super_admin'), restaurant_controller_1.RestaurantController.updateRestaurantAdmin);
router.get('/restaurants/:id/settings', (0, auth_1.authorize)('super_admin', 'restaurant_admin'), restaurant_controller_1.RestaurantController.getRestaurantSettings);
router.put('/restaurants/:id/settings', (0, auth_1.authorize)('super_admin'), restaurant_controller_1.RestaurantController.updateRestaurantSettings);
router.put('/restaurants/:id/subscription', (0, auth_1.authorize)('super_admin'), restaurant_controller_1.RestaurantController.updateRestaurantSubscription);
// Subscription Plan Routes
router.post('/subscription-plans', (0, auth_1.authorize)('super_admin'), (0, restaurant_validator_1.validate)(restaurant_validator_1.createSubscriptionPlanValidation), restaurant_controller_1.RestaurantController.createSubscriptionPlan);
router.get('/subscription-plans', restaurant_controller_1.RestaurantController.listSubscriptionPlans);
router.get('/subscription-plans/:id', restaurant_controller_1.RestaurantController.getSubscriptionPlan);
// Restaurant Subscription Routes
router.post('/restaurant-subscriptions', (0, auth_1.authorize)('super_admin'), (0, restaurant_validator_1.validate)(restaurant_validator_1.createRestaurantSubscriptionValidation), restaurant_controller_1.RestaurantController.createRestaurantSubscription);
router.get('/restaurants/:restaurantId/subscription', (0, auth_1.authorize)('super_admin'), restaurant_controller_1.RestaurantController.getRestaurantSubscription);
// Restaurant Admin Routes
router.post('/restaurant-admins', (0, auth_1.authorize)('super_admin'), (0, restaurant_validator_1.validate)(restaurant_validator_1.createRestaurantAdminValidation), restaurant_controller_1.RestaurantController.createRestaurantAdmin);
// Dashboard/Stats
router.get('/restaurants/stats', (0, auth_1.authorize)('super_admin'), restaurant_controller_1.RestaurantController.getRestaurantStats);
exports.default = router;
