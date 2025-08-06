import { Request, Response, NextFunction } from 'express';
const { validationResult } = require('express-validator');
import { OutletRepository } from '../repositories/outlet.repository';
import { RestaurantRepository } from '../repositories/restaurant.repository';
import { CreateOutletInput, UpdateOutletInput } from '../types/outlet';

const outletRepo = new OutletRepository(require('../config/db').pool);
const restaurantRepo = new RestaurantRepository(require('../config/db').pool);

export class OutletController {
  static async getOutlets(req: Request, res: Response, next: NextFunction) {
    try {
      const { restaurantId } = req.params;
      const outlets = await outletRepo.getOutletsByRestaurant(parseInt(restaurantId));
      res.json(outlets);
    } catch (error) {
      next(error);
    }
  }

  static async getOutlet(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const outlet = await outletRepo.getOutletById(parseInt(id));
      
      if (!outlet) {
        return res.status(404).json({ message: 'Outlet not found' });
      }
      
      res.json(outlet);
    } catch (error) {
      next(error);
    }
  }

  static async createOutlet(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { restaurantId } = req.params;
      const input: CreateOutletInput = {
        ...req.body,
        restaurant_id: parseInt(restaurantId)
      };

      // Check if restaurant exists
      const restaurant = await restaurantRepo.getRestaurantById(parseInt(restaurantId));
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }

      // Check outlet limit
      const currentCount = await outletRepo.getOutletCountByRestaurant(parseInt(restaurantId));
      // TODO: Get max_outlets from restaurant settings
      const maxOutlets = 10; // Default limit
      
      if (currentCount >= maxOutlets) {
        return res.status(400).json({ message: `Maximum ${maxOutlets} outlets allowed` });
      }

      const outlet = await outletRepo.createOutlet(input);
      res.status(201).json(outlet);
    } catch (error) {
      next(error);
    }
  }

  static async updateOutlet(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updates: UpdateOutletInput = req.body;
      
      const outlet = await outletRepo.updateOutlet(parseInt(id), updates);
      
      if (!outlet) {
        return res.status(404).json({ message: 'Outlet not found' });
      }
      
      res.json(outlet);
    } catch (error) {
      next(error);
    }
  }

  static async deleteOutlet(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const success = await outletRepo.deleteOutlet(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ message: 'Outlet not found' });
      }
      
      res.json({ message: 'Outlet deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
} 