"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleController = void 0;
const module_repository_1 = require("../repositories/module.repository");
const db_1 = require("../config/db");
const moduleRepo = new module_repository_1.ModuleRepository(db_1.pool);
class ModuleController {
    // Module CRUD Operations
    static async createModule(req, res, next) {
        try {
            const input = req.body;
            const module = await moduleRepo.createModule(input);
            res.status(201).json(module);
        }
        catch (error) {
            next(error);
        }
    }
    static async getModule(req, res, next) {
        try {
            const { id } = req.params;
            const module = await moduleRepo.getModuleById(parseInt(id));
            if (!module) {
                return res.status(404).json({ message: 'Module not found' });
            }
            res.json(module);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateModule(req, res, next) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const module = await moduleRepo.updateModule(parseInt(id), updates);
            if (!module) {
                return res.status(404).json({ message: 'Module not found' });
            }
            res.json(module);
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteModule(req, res, next) {
        try {
            const { id } = req.params;
            const success = await moduleRepo.deleteModule(parseInt(id));
            if (!success) {
                return res.status(404).json({ message: 'Module not found' });
            }
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
    static async listModules(req, res, next) {
        try {
            const activeOnly = req.query.active !== 'false';
            const modules = await moduleRepo.listModules(activeOnly);
            res.json(modules);
        }
        catch (error) {
            next(error);
        }
    }
    // Restaurant Settings Operations
    static async getRestaurantSettings(req, res, next) {
        try {
            const { restaurantId } = req.params;
            const settings = await moduleRepo.getRestaurantSettings(parseInt(restaurantId));
            if (!settings) {
                return res.status(404).json({ message: 'Restaurant settings not found' });
            }
            res.json(settings);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateRestaurantSettings(req, res, next) {
        try {
            const { restaurantId } = req.params;
            const updates = req.body;
            const settings = await moduleRepo.updateRestaurantSettings(parseInt(restaurantId), updates);
            if (!settings) {
                return res.status(404).json({ message: 'Restaurant settings not found' });
            }
            res.json(settings);
        }
        catch (error) {
            next(error);
        }
    }
    // Restaurant Module Permissions Operations
    static async getRestaurantModulePermissions(req, res, next) {
        try {
            const { restaurantId } = req.params;
            const permissions = await moduleRepo.getRestaurantModulePermissions(parseInt(restaurantId));
            res.json(permissions);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateRestaurantModulePermissions(req, res, next) {
        try {
            const { restaurantId } = req.params;
            const input = req.body;
            await moduleRepo.updateRestaurantModulePermissions(parseInt(restaurantId), input.module_permissions);
            res.json({ message: 'Module permissions updated successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    // Combined restaurant data with settings and permissions
    static async getRestaurantWithDetails(req, res, next) {
        try {
            const { restaurantId } = req.params;
            const restaurant = await moduleRepo.getRestaurantWithSettingsAndPermissions(parseInt(restaurantId));
            if (!restaurant) {
                return res.status(404).json({ message: 'Restaurant not found' });
            }
            res.json(restaurant);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ModuleController = ModuleController;
