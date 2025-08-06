"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const module_controller_1 = require("../controllers/module.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_1.protect);
// Module Management Routes (Super Admin Only)
router.post('/', (0, auth_1.authorize)('super_admin'), module_controller_1.ModuleController.createModule);
router.get('/', (0, auth_1.authorize)('super_admin'), module_controller_1.ModuleController.listModules);
router.get('/:id', (0, auth_1.authorize)('super_admin'), module_controller_1.ModuleController.getModule);
router.put('/:id', (0, auth_1.authorize)('super_admin'), module_controller_1.ModuleController.updateModule);
router.delete('/:id', (0, auth_1.authorize)('super_admin'), module_controller_1.ModuleController.deleteModule);
// Restaurant Settings Routes
router.get('/restaurants/:restaurantId/settings', (0, auth_1.authorize)('super_admin'), module_controller_1.ModuleController.getRestaurantSettings);
router.put('/restaurants/:restaurantId/settings', (0, auth_1.authorize)('super_admin'), module_controller_1.ModuleController.updateRestaurantSettings);
// Restaurant Module Permissions Routes
router.get('/restaurants/:restaurantId/module-permissions', (0, auth_1.authorize)('super_admin'), module_controller_1.ModuleController.getRestaurantModulePermissions);
router.put('/restaurants/:restaurantId/module-permissions', (0, auth_1.authorize)('super_admin'), module_controller_1.ModuleController.updateRestaurantModulePermissions);
// Combined restaurant details
router.get('/restaurants/:restaurantId/details', (0, auth_1.authorize)('super_admin'), module_controller_1.ModuleController.getRestaurantWithDetails);
exports.default = router;
