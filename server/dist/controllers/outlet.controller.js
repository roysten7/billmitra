"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutletController = void 0;
const express_validator_1 = require("express-validator");
const outlet_repository_1 = require("../repositories/outlet.repository");
const restaurant_repository_1 = require("../repositories/restaurant.repository");
const outletRepo = new outlet_repository_1.OutletRepository(require('../config/db').pool);
const restaurantRepo = new restaurant_repository_1.RestaurantRepository(require('../config/db').pool);
class OutletController {
    static async getOutlets(req, res, next) {
        try {
            const { restaurantId } = req.params;
            const outlets = await outletRepo.getOutletsByRestaurant(parseInt(restaurantId));
            res.json(outlets);
        }
        catch (error) {
            next(error);
        }
    }
    static async getOutlet(req, res, next) {
        try {
            const { id } = req.params;
            const outlet = await outletRepo.getOutletById(parseInt(id));
            if (!outlet) {
                return res.status(404).json({ message: 'Outlet not found' });
            }
            res.json(outlet);
        }
        catch (error) {
            next(error);
        }
    }
    static async createOutlet(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { restaurantId } = req.params;
            const input = {
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
        }
        catch (error) {
            next(error);
        }
    }
    static async updateOutlet(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { id } = req.params;
            const updates = req.body;
            const outlet = await outletRepo.updateOutlet(parseInt(id), updates);
            if (!outlet) {
                return res.status(404).json({ message: 'Outlet not found' });
            }
            res.json(outlet);
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteOutlet(req, res, next) {
        try {
            const { id } = req.params;
            const success = await outletRepo.deleteOutlet(parseInt(id));
            if (!success) {
                return res.status(404).json({ message: 'Outlet not found' });
            }
            res.json({ message: 'Outlet deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.OutletController = OutletController;
