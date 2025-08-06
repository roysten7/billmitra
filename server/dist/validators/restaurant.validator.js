"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.createRestaurantAdminValidation = exports.createRestaurantSubscriptionValidation = exports.createSubscriptionPlanValidation = exports.updateRestaurantValidation = exports.createRestaurantValidation = void 0;
// Using require for express-validator to avoid TypeScript module issues
const { body } = require('express-validator');
exports.createRestaurantValidation = [
    body('name').trim().notEmpty().withMessage('Restaurant name is required'),
    body('description').optional().isString(),
    body('address').optional().isString(),
    body('city').optional().isString(),
    body('state').optional().isString(),
    body('country').optional().isString(),
    body('postal_code').optional().isPostalCode('any'),
    body('phone').optional().isMobilePhone('any'),
    body('email').optional().isEmail().withMessage('Invalid email address'),
    body('website').optional().isURL().withMessage('Invalid website URL'),
    body('timezone').optional().isIn([
        'Asia/Kolkata', 'Asia/Dubai', 'America/New_York', 'America/Los_Angeles', 'Europe/London'
    ]).withMessage('Invalid timezone')
];
exports.updateRestaurantValidation = [
    body('name').optional().trim().notEmpty().withMessage('Restaurant name cannot be empty'),
    body('description').optional().isString(),
    body('address').optional().isString(),
    body('city').optional().isString(),
    body('state').optional().isString(),
    body('country').optional().isString(),
    body('postal_code').optional().isPostalCode('any'),
    body('phone').optional().isMobilePhone('any'),
    body('email').optional().isEmail().withMessage('Invalid email address'),
    body('website').optional().isURL().withMessage('Invalid website URL'),
    body('timezone').optional().isIn([
        'Asia/Kolkata', 'Asia/Dubai', 'America/New_York', 'America/Los_Angeles', 'Europe/London'
    ]).withMessage('Invalid timezone'),
    body('is_active').optional().isBoolean()
];
exports.createSubscriptionPlanValidation = [
    body('name').trim().notEmpty().withMessage('Plan name is required'),
    body('description').optional().isString(),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('currency').optional().isCurrency().withMessage('Invalid currency code'),
    body('billing_cycle').isIn(['monthly', 'quarterly', 'annually']).withMessage('Invalid billing cycle'),
    body('features').isObject().withMessage('Features must be an object'),
    body('is_active').optional().isBoolean()
];
exports.createRestaurantSubscriptionValidation = [
    body('restaurant_id').isInt({ min: 1 }).withMessage('Invalid restaurant ID'),
    body('plan_id').isInt({ min: 1 }).withMessage('Invalid plan ID'),
    body('start_date').isISO8601().withMessage('Invalid start date'),
    body('end_date').isISO8601().withMessage('Invalid end date'),
    body('status').optional().isIn(['active', 'expired', 'canceled', 'pending']).withMessage('Invalid status'),
    body('payment_status').optional().isIn(['paid', 'unpaid', 'refunded', 'failed', 'pending']).withMessage('Invalid payment status'),
    body('payment_reference').optional().isString()
];
exports.createRestaurantAdminValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('restaurant_id').isInt({ min: 1 }).withMessage('Invalid restaurant ID')
];
// Using require for express-validator to avoid TypeScript module issues
const { validationResult } = require('express-validator');
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map((validation) => validation.run(req)));
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        res.status(400).json({ errors: errors.array() });
    };
};
exports.validate = validate;
