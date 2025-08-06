import { Request, Response, NextFunction } from 'express';
import { subscriptionRepository } from '../repositories/subscription.repository';
import { UserRole } from '../types/user';
import { AVAILABLE_MODULES } from '../types/subscription';

type ModuleName = typeof AVAILABLE_MODULES[number];

/**
 * Middleware to check if the restaurant's subscription includes access to a specific module
 * @param moduleName The name of the module to check access for
 */
export function checkSubscriptionAccess(moduleName: ModuleName) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Skip check for super admins
      if (req.user?.role === 'super_admin') {
        return next();
      }

      const restaurantId = req.user?.restaurantId || req.params.restaurantId;
      
      if (!restaurantId) {
        return res.status(400).json({ 
          message: 'Restaurant ID is required to check subscription access' 
        });
      }

      if (!AVAILABLE_MODULES.includes(moduleName)) {
        return res.status(400).json({ 
          message: 'Invalid module name',
          validModules: AVAILABLE_MODULES 
        });
      }

      const hasAccess = await subscriptionRepository.isModuleEnabled(restaurantId, moduleName);
      
      if (!hasAccess) {
        return res.status(403).json({ 
          message: `This feature requires a subscription to the ${moduleName} module`,
          code: 'SUBSCRIPTION_REQUIRED',
          module: moduleName
        });
      }

      next();
    } catch (error: any) {
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
export async function requireActiveSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Skip check for super admins
    if (req.user?.role === 'super_admin') {
      return next();
    }

    const restaurantId = req.user?.restaurantId || req.params.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({ 
        message: 'Restaurant ID is required to check subscription' 
      });
    }

    const subscription = await subscriptionRepository.getSubscriptionByRestaurantId(restaurantId);
    
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
  } catch (error: any) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({ 
      message: 'Failed to verify subscription status',
      error: error.message 
    });
  }
}

// Extend Express Request type to include subscription
declare global {
  namespace Express {
    interface Request {
      subscription?: any; // You can replace 'any' with a more specific type if needed
    }
  }
}
