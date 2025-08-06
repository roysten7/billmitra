"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const outlet_controller_1 = require("../controllers/outlet.controller");
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// Validation middleware
const createOutletValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Outlet name is required'),
    (0, express_validator_1.body)('zip_code').notEmpty().withMessage('Zip code is required'),
    (0, express_validator_1.body)('country').notEmpty().withMessage('Country is required'),
    (0, express_validator_1.body)('state').notEmpty().withMessage('State is required'),
    (0, express_validator_1.body)('city').notEmpty().withMessage('City is required'),
    (0, express_validator_1.body)('address').notEmpty().withMessage('Address is required'),
    (0, express_validator_1.body)('latitude').isNumeric().withMessage('Latitude must be a number'),
    (0, express_validator_1.body)('longitude').isNumeric().withMessage('Longitude must be a number'),
    (0, express_validator_1.body)('tax_authority_name').notEmpty().withMessage('Tax authority name is required'),
];
const updateOutletValidation = [
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Outlet name cannot be empty'),
    (0, express_validator_1.body)('zip_code').optional().notEmpty().withMessage('Zip code cannot be empty'),
    (0, express_validator_1.body)('country').optional().notEmpty().withMessage('Country cannot be empty'),
    (0, express_validator_1.body)('state').optional().notEmpty().withMessage('State cannot be empty'),
    (0, express_validator_1.body)('city').optional().notEmpty().withMessage('City cannot be empty'),
    (0, express_validator_1.body)('address').optional().notEmpty().withMessage('Address cannot be empty'),
    (0, express_validator_1.body)('latitude').optional().isNumeric().withMessage('Latitude must be a number'),
    (0, express_validator_1.body)('longitude').optional().isNumeric().withMessage('Longitude must be a number'),
    (0, express_validator_1.body)('tax_authority_name').optional().notEmpty().withMessage('Tax authority name cannot be empty'),
];
// Outlet Routes
router.get('/restaurants/:restaurantId/outlets', (0, auth_1.authorize)('super_admin', 'restaurant_admin'), outlet_controller_1.OutletController.getOutlets);
router.get('/outlets/:id', (0, auth_1.authorize)('super_admin', 'restaurant_admin'), outlet_controller_1.OutletController.getOutlet);
router.post('/restaurants/:restaurantId/outlets', (0, auth_1.authorize)('super_admin', 'restaurant_admin'), createOutletValidation, outlet_controller_1.OutletController.createOutlet);
router.put('/outlets/:id', (0, auth_1.authorize)('super_admin', 'restaurant_admin'), updateOutletValidation, outlet_controller_1.OutletController.updateOutlet);
router.delete('/outlets/:id', (0, auth_1.authorize)('super_admin', 'restaurant_admin'), outlet_controller_1.OutletController.deleteOutlet);
exports.default = router;
