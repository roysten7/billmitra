"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantController = void 0;
// Using require for express-validator to avoid TypeScript module issues
const { validationResult } = require('express-validator');
const restaurant_repository_1 = require("../repositories/restaurant.repository");
const restaurant_service_1 = require("../services/restaurant.service");
const db_1 = require("../config/db");
const restaurantRepo = new restaurant_repository_1.RestaurantRepository(db_1.pool);
class RestaurantController {
    // Restaurant CRUD Operations
    static async createRestaurant(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const input = req.body;
            const userId = req.user.id; // From auth middleware
            const restaurant = await restaurantRepo.createRestaurant(input, userId);
            res.status(201).json(restaurant);
        }
        catch (error) {
            next(error);
        }
    }
    static async getRestaurant(req, res, next) {
        try {
            const { id } = req.params;
            const restaurant = await restaurantRepo.getRestaurantById(parseInt(id));
            if (!restaurant) {
                return res.status(404).json({ message: 'Restaurant not found' });
            }
            res.json(restaurant);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateRestaurant(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { id } = req.params;
            const updates = req.body;
            const restaurant = await restaurantRepo.updateRestaurant(parseInt(id), updates);
            if (!restaurant) {
                return res.status(404).json({ message: 'Restaurant not found' });
            }
            res.json(restaurant);
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteRestaurant(req, res, next) {
        try {
            const { id } = req.params;
            const success = await restaurantRepo.deleteRestaurant(parseInt(id));
            if (!success) {
                return res.status(404).json({ message: 'Restaurant not found' });
            }
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
    static async resetRestaurantAdminPassword(req, res, next) {
        try {
            const { id } = req.params;
            const { new_password } = req.body;
            if (!new_password || new_password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters long' });
            }
            const success = await restaurantRepo.resetRestaurantAdminPassword(parseInt(id), new_password);
            if (!success) {
                return res.status(404).json({ message: 'Restaurant admin not found' });
            }
            res.json({ message: 'Password reset successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateRestaurantAdmin(req, res, next) {
        try {
            const { id } = req.params;
            const { admin_name, admin_email, admin_password } = req.body;
            if (!admin_name || !admin_email) {
                return res.status(400).json({ message: 'Admin name and email are required' });
            }
            const success = await restaurantRepo.updateRestaurantAdmin(parseInt(id), {
                admin_name,
                admin_email,
                admin_password
            });
            if (!success) {
                return res.status(404).json({ message: 'Restaurant admin not found' });
            }
            res.json({ message: 'Restaurant admin updated successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateRestaurantSubscription(req, res, next) {
        try {
            const { id } = req.params;
            const { plan_id, start_date, end_date, grace_period_days } = req.body;
            if (!plan_id || !start_date || !end_date) {
                return res.status(400).json({ message: 'Plan ID, start date, and end date are required' });
            }
            const success = await restaurantRepo.updateRestaurantSubscription(parseInt(id), {
                plan_id,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                grace_period_days: grace_period_days || 7
            });
            if (!success) {
                return res.status(404).json({ message: 'Restaurant subscription not found' });
            }
            res.json({ message: 'Restaurant subscription updated successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async getRestaurantSettings(req, res, next) {
        try {
            const { id } = req.params;
            const settings = await restaurantRepo.getRestaurantSettings(parseInt(id));
            res.json(settings);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateRestaurantSettings(req, res, next) {
        try {
            const { id } = req.params;
            const { max_outlets, module_permissions } = req.body;
            const success = await restaurantRepo.updateRestaurantSettings(parseInt(id), {
                max_outlets: max_outlets || 1,
                module_permissions: module_permissions || []
            });
            if (!success) {
                return res.status(404).json({ message: 'Restaurant settings not found' });
            }
            res.json({ message: 'Restaurant settings updated successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async listRestaurants(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const restaurants = await restaurant_service_1.RestaurantService.getRestaurantsWithDetails(page, limit);
            res.json(restaurants);
        }
        catch (error) {
            next(error);
        }
    }
    static async createRestaurantWithSubscription(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const input = req.body;
            const userId = req.user.id; // From auth middleware
            const result = await restaurant_service_1.RestaurantService.createRestaurantWithSubscription(input, userId);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    // Subscription Plan Operations
    static async createSubscriptionPlan(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const input = req.body;
            const plan = await restaurantRepo.createSubscriptionPlan(input);
            res.status(201).json(plan);
        }
        catch (error) {
            next(error);
        }
    }
    static async getSubscriptionPlan(req, res, next) {
        try {
            const { id } = req.params;
            const plan = await restaurantRepo.getSubscriptionPlanById(parseInt(id));
            if (!plan) {
                return res.status(404).json({ message: 'Subscription plan not found' });
            }
            res.json(plan);
        }
        catch (error) {
            next(error);
        }
    }
    static async listSubscriptionPlans(req, res, next) {
        try {
            const isActive = req.query.active !== 'false'; // Default to true if not specified
            const plans = await restaurantRepo.listSubscriptionPlans(isActive);
            res.json(plans);
        }
        catch (error) {
            next(error);
        }
    }
    // Restaurant Subscription Operations
    static async createRestaurantSubscription(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const input = req.body;
            const subscription = await restaurantRepo.createRestaurantSubscription(input);
            res.status(201).json(subscription);
        }
        catch (error) {
            next(error);
        }
    }
    static async getRestaurantSubscription(req, res, next) {
        try {
            const { restaurantId } = req.params;
            const subscription = await restaurantRepo.getRestaurantSubscription(parseInt(restaurantId));
            if (!subscription) {
                return res.status(404).json({ message: 'No active subscription found for this restaurant' });
            }
            res.json(subscription);
        }
        catch (error) {
            next(error);
        }
    }
    // Restaurant Admin Operations
    static async createRestaurantAdmin(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const input = req.body;
            const userId = req.user.id; // From auth middleware
            // Verify the requester is a super admin
            const requester = req.user;
            if (requester.role !== 'super_admin') {
                return res.status(403).json({ message: 'Only super admins can create restaurant admins' });
            }
            // Create the restaurant admin
            const result = await restaurantRepo.createRestaurantAdmin(input);
            res.status(201).json({
                id: result.id,
                message: 'Restaurant admin created successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Dashboard/Stats
    static async getRestaurantStats(req, res, next) {
        try {
            // This would be more comprehensive in a real application
            const stats = {
                totalRestaurants: 0,
                activeSubscriptions: 0,
                // Add more stats as needed
            };
            res.json(stats);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.RestaurantController = RestaurantController;
