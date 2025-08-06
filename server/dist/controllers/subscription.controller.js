"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionController = exports.SubscriptionController = void 0;
const subscription_1 = require("../types/subscription");
const subscription_repository_1 = require("../repositories/subscription.repository");
class SubscriptionController {
    // Plan Management
    async createPlan(req, res) {
        try {
            const input = req.body;
            const plan = await subscription_repository_1.subscriptionRepository.createPlan(input);
            res.status(201).json(plan);
        }
        catch (error) {
            console.error('Error creating plan:', error);
            res.status(500).json({ message: 'Failed to create plan', error: error.message });
        }
    }
    async getPlans(req, res) {
        try {
            const activeOnly = req.query.activeOnly !== 'false'; // Default to true
            const plans = await subscription_repository_1.subscriptionRepository.getAllPlans(activeOnly);
            res.json(plans);
        }
        catch (error) {
            console.error('Error fetching plans:', error);
            res.status(500).json({ message: 'Failed to fetch plans', error: error.message });
        }
    }
    async getPlan(req, res) {
        try {
            const { id } = req.params;
            const plan = await subscription_repository_1.subscriptionRepository.getPlanById(id);
            if (!plan) {
                return res.status(404).json({ message: 'Plan not found' });
            }
            res.json(plan);
        }
        catch (error) {
            console.error('Error fetching plan:', error);
            res.status(500).json({ message: 'Failed to fetch plan', error: error.message });
        }
    }
    async updatePlan(req, res) {
        try {
            const { id } = req.params;
            const input = { ...req.body, id };
            const updatedPlan = await subscription_repository_1.subscriptionRepository.updatePlan(input);
            if (!updatedPlan) {
                return res.status(404).json({ message: 'Plan not found' });
            }
            res.json(updatedPlan);
        }
        catch (error) {
            console.error('Error updating plan:', error);
            res.status(500).json({ message: 'Failed to update plan', error: error.message });
        }
    }
    async deletePlan(req, res) {
        try {
            const { id } = req.params;
            const success = await subscription_repository_1.subscriptionRepository.deletePlan(id);
            if (!success) {
                return res.status(404).json({ message: 'Plan not found' });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Error deleting plan:', error);
            res.status(500).json({ message: 'Failed to delete plan', error: error.message });
        }
    }
    // Plan Modules Management
    async getPlanModules(req, res) {
        try {
            const { planId } = req.params;
            const modules = await subscription_repository_1.subscriptionRepository.getPlanModules(planId);
            res.json(modules);
        }
        catch (error) {
            console.error('Error fetching plan modules:', error);
            res.status(500).json({ message: 'Failed to fetch plan modules', error: error.message });
        }
    }
    async updatePlanModules(req, res) {
        try {
            const { planId } = req.params;
            const input = {
                plan_id: planId,
                modules: req.body.modules || []
            };
            // Validate module names
            const invalidModules = input.modules.filter(m => !subscription_1.AVAILABLE_MODULES.includes(m.name));
            if (invalidModules.length > 0) {
                return res.status(400).json({
                    message: 'Invalid module names',
                    invalidModules: invalidModules.map(m => m.name)
                });
            }
            const updatedModules = await subscription_repository_1.subscriptionRepository.updatePlanModules(input);
            res.json(updatedModules);
        }
        catch (error) {
            console.error('Error updating plan modules:', error);
            res.status(500).json({ message: 'Failed to update plan modules', error: error.message });
        }
    }
    // Subscription Management
    async createSubscription(req, res) {
        try {
            const input = req.body;
            const subscription = await subscription_repository_1.subscriptionRepository.createSubscription(input);
            res.status(201).json(subscription);
        }
        catch (error) {
            console.error('Error creating subscription:', error);
            res.status(500).json({ message: 'Failed to create subscription', error: error.message });
        }
    }
    async getRestaurantSubscription(req, res) {
        try {
            const { restaurantId } = req.params;
            const subscription = await subscription_repository_1.subscriptionRepository.getSubscriptionByRestaurantId(restaurantId);
            if (!subscription) {
                return res.status(404).json({ message: 'Subscription not found for this restaurant' });
            }
            res.json(subscription);
        }
        catch (error) {
            console.error('Error fetching subscription:', error);
            res.status(500).json({ message: 'Failed to fetch subscription', error: error.message });
        }
    }
    async updateSubscription(req, res) {
        try {
            const { id } = req.params;
            const input = { ...req.body, id };
            const updatedSubscription = await subscription_repository_1.subscriptionRepository.updateSubscription(input);
            if (!updatedSubscription) {
                return res.status(404).json({ message: 'Subscription not found' });
            }
            res.json(updatedSubscription);
        }
        catch (error) {
            console.error('Error updating subscription:', error);
            res.status(500).json({ message: 'Failed to update subscription', error: error.message });
        }
    }
    async cancelSubscription(req, res) {
        try {
            const { id } = req.params;
            const subscription = await subscription_repository_1.subscriptionRepository.cancelSubscription(id);
            if (!subscription) {
                return res.status(404).json({ message: 'Subscription not found' });
            }
            res.json({ message: 'Subscription cancelled successfully', subscription });
        }
        catch (error) {
            console.error('Error cancelling subscription:', error);
            res.status(500).json({ message: 'Failed to cancel subscription', error: error.message });
        }
    }
    // Utility Endpoints
    async getRestaurantModules(req, res) {
        try {
            const { restaurantId } = req.params;
            const modules = await subscription_repository_1.subscriptionRepository.getRestaurantActiveModules(restaurantId);
            res.json({ modules });
        }
        catch (error) {
            console.error('Error fetching restaurant modules:', error);
            res.status(500).json({ message: 'Failed to fetch restaurant modules', error: error.message });
        }
    }
    async checkModuleAccess(req, res) {
        try {
            const { restaurantId, moduleName } = req.params;
            if (!subscription_1.AVAILABLE_MODULES.includes(moduleName)) {
                return res.status(400).json({
                    message: 'Invalid module name',
                    validModules: subscription_1.AVAILABLE_MODULES
                });
            }
            const hasAccess = await subscription_repository_1.subscriptionRepository.isModuleEnabled(restaurantId, moduleName);
            res.json({ hasAccess });
        }
        catch (error) {
            console.error('Error checking module access:', error);
            res.status(500).json({ message: 'Failed to check module access', error: error.message });
        }
    }
    // Get all available modules
    getAvailableModules(_req, res) {
        res.json({ modules: subscription_1.AVAILABLE_MODULES });
    }
}
exports.SubscriptionController = SubscriptionController;
exports.subscriptionController = new SubscriptionController();
