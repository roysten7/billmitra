import { Router } from 'express';
import { OutletController } from '../controllers/outlet.controller';
import { authorize } from '../middleware/auth';
const { body } = require('express-validator');

const router = Router();

// Validation middleware
const createOutletValidation = [
  body('name').notEmpty().withMessage('Outlet name is required'),
  body('zip_code').notEmpty().withMessage('Zip code is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('latitude').isNumeric().withMessage('Latitude must be a number'),
  body('longitude').isNumeric().withMessage('Longitude must be a number'),
  body('tax_authority_name').notEmpty().withMessage('Tax authority name is required'),
];

const updateOutletValidation = [
  body('name').optional().notEmpty().withMessage('Outlet name cannot be empty'),
  body('zip_code').optional().notEmpty().withMessage('Zip code cannot be empty'),
  body('country').optional().notEmpty().withMessage('Country cannot be empty'),
  body('state').optional().notEmpty().withMessage('State cannot be empty'),
  body('city').optional().notEmpty().withMessage('City cannot be empty'),
  body('address').optional().notEmpty().withMessage('Address cannot be empty'),
  body('latitude').optional().isNumeric().withMessage('Latitude must be a number'),
  body('longitude').optional().isNumeric().withMessage('Longitude must be a number'),
  body('tax_authority_name').optional().notEmpty().withMessage('Tax authority name cannot be empty'),
];

// Outlet Routes
router.get(
  '/restaurants/:restaurantId/outlets',
  authorize('super_admin', 'restaurant_admin'),
  OutletController.getOutlets
);

router.get(
  '/outlets/:id',
  authorize('super_admin', 'restaurant_admin'),
  OutletController.getOutlet
);

router.post(
  '/restaurants/:restaurantId/outlets',
  authorize('super_admin', 'restaurant_admin'),
  createOutletValidation,
  OutletController.createOutlet
);

router.put(
  '/outlets/:id',
  authorize('super_admin', 'restaurant_admin'),
  updateOutletValidation,
  OutletController.updateOutlet
);

router.delete(
  '/outlets/:id',
  authorize('super_admin', 'restaurant_admin'),
  OutletController.deleteOutlet
);

export default router; 