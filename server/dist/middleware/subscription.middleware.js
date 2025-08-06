"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSubscriptionAccess = checkSubscriptionAccess;
exports.requireActiveSubscription = requireActiveSubscription;
const subscription_repository_1 = require("../repositories/subscription.repository");
const subscription_1 = require("../types/subscription");
/**
 * Middleware to check if the restaurant's subscription includes access to a specific module
 * @param moduleName The name of the module to check access for
 */
function checkSubscriptionAccess(moduleName) {
    return async (req, res, next) => {
        var _a, _b;
        try {
            // Skip check for super admins
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === user_1.UserRole.SUPER_ADMIN) {
                return next();
            }
            const restaurantId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.restaurantId) || req.params.restaurantId;
            if (!restaurantId) {
                return res.status(400).json({
                    message: 'Restaurant ID is required to check subscription access'
                });
            }
            if (!subscription_1.AVAILABLE_MODULES.includes(moduleName)) {
                return res.status(400).json({
                    message: 'Invalid module name',
                    validModules: subscription_1.AVAILABLE_MODULES
                });
            }
            const hasAccess = await subscription_repository_1.subscriptionRepository.isModuleEnabled(restaurantId, moduleName);
            if (!hasAccess) {
                return res.status(403).json({
                    message: `This feature requires a subscription to the ${moduleName} module`,
                    code: 'SUBSCRIPTION_REQUIRED',
                    module: moduleName
                });
            }
            next();
        }
        catch (error) {
            console.error('Error checking subscription access:', error);
            res.status(500).json({
                message: 'Failed to verify subscription access',
                error: error.message
            });
        }
    };
}
/**
 * Middleware to check if the restaurant has an active subscription
 */
async function requireActiveSubscription(req, res, next) {
    var _a, _b;
    try {
        // Skip check for super admins
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === user_1.UserRole.SUPER_ADMIN) {
            return next();
        }
        const restaurantId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.restaurantId) || req.params.restaurantId;
        if (!restaurantId) {
            return res.status(400).json({
                message: 'Restaurant ID is required to check subscription'
            });
        }
        const subscription = await subscription_repository_1.subscriptionRepository.getSubscriptionByRestaurantId(restaurantId);
        if (!subscription) {
            return res.status(403).json({
                message: 'No active subscription found for this restaurant',
                code: 'SUBSCRIPTION_NOT_FOUND'
            });
        }
        if (!subscription.is_active) {
            return res.status(403).json({
                message: 'Your subscription is not active',
                code: 'SUBSCRIPTION_INACTIVE'
            });
        }
        if (new Date(subscription.end_date) < new Date()) {
            return res.status(403).json({
                message: 'Your subscription has expired',
                code: 'SUBSCRIPTION_EXPIRED',
                expiryDate: subscription.end_date
            });
        }
        // Attach subscription info to the request for use in subsequent middleware/controllers
        req.subscription = subscription;
        next();
    }
    catch (error) {
        console.error('Error checking subscription status:', error);
        res.status(500).json({
            message: 'Failed to verify subscription status',
            error: error.message
        });
    }
}
