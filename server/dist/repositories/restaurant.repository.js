"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantRepository = void 0;
class RestaurantRepository {
    constructor(pool) {
        this.pool = pool;
    }
    // Restaurant CRUD Operations
    async createRestaurant(input, createdBy, client) {
        const query = `
      INSERT INTO restaurants (
        name, description, address, city, state, country, 
        postal_code, phone, email, website, timezone, created_by
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
        const values = [
            input.name,
            input.description || null,
            input.address || null,
            input.city || null,
            input.state || null,
            input.country || null,
            input.postal_code || null,
            input.phone || null,
            input.email || null,
            input.website || null,
            input.timezone || 'Asia/Kolkata',
            createdBy
        ];
        const { rows } = client ? await client.query(query, values) : await this.pool.query(query, values);
        return rows[0];
    }
    async getRestaurantById(id) {
        const { rows } = await this.pool.query('SELECT * FROM restaurants WHERE id = $1', [id]);
        return rows[0] || null;
    }
    async updateRestaurant(id, updates) {
        const setClause = [];
        const values = [];
        let paramIndex = 1;
        // Build dynamic SET clause based on provided fields
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                setClause.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }
        if (setClause.length === 0) {
            return this.getRestaurantById(id);
        }
        values.push(id);
        const query = `
      UPDATE restaurants 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
        const { rows } = await this.pool.query(query, values);
        return rows[0] || null;
    }
    async deleteRestaurant(id) {
        var _a;
        const result = await this.pool.query('DELETE FROM restaurants WHERE id = $1', [id]);
        // Safely handle the case where rowCount might be undefined
        return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
    }
    async resetRestaurantAdminPassword(restaurantId, newPassword) {
        var _a;
        const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const query = `
      UPDATE users 
      SET password = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE restaurant_id = $2 AND role = 'restaurant_admin'
    `;
        const result = await this.pool.query(query, [hashedPassword, restaurantId]);
        return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
    }
    async updateRestaurantAdmin(restaurantId, data) {
        var _a;
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            // Check if restaurant exists
            const restaurant = await this.getRestaurantById(restaurantId);
            if (!restaurant) {
                throw new Error('Restaurant not found');
            }
            // Update admin details
            let query = `
        UPDATE users 
        SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP 
        WHERE restaurant_id = $3 AND role = 'restaurant_admin'
      `;
            let values = [data.admin_name, data.admin_email, restaurantId];
            // If password is provided, hash it and include in update
            if (data.admin_password) {
                const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
                const hashedPassword = await bcrypt.hash(data.admin_password, 10);
                query = `
          UPDATE users 
          SET name = $1, email = $2, password = $3, updated_at = CURRENT_TIMESTAMP 
          WHERE restaurant_id = $4 AND role = 'restaurant_admin'
        `;
                values = [data.admin_name, data.admin_email, hashedPassword, restaurantId];
            }
            const result = await client.query(query, values);
            if (((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) === 0) {
                throw new Error('Restaurant admin not found');
            }
            await client.query('COMMIT');
            return true;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async listRestaurants(limit = 10, offset = 0) {
        const { rows } = await this.pool.query('SELECT * FROM restaurants ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
        return rows;
    }
    // Subscription Plan CRUD Operations
    async createSubscriptionPlan(input) {
        const query = `
      INSERT INTO plans (
        name, description, monthly_price, yearly_price, is_active
      ) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const values = [
            input.name,
            input.description || null,
            input.monthly_price,
            input.yearly_price,
            input.is_active !== undefined ? input.is_active : true
        ];
        const { rows } = await this.pool.query(query, values);
        return this.mapSubscriptionPlan(rows[0]);
    }
    async getSubscriptionPlanById(id) {
        const { rows } = await this.pool.query('SELECT * FROM plans WHERE id = $1', [id]);
        return rows[0] ? this.mapSubscriptionPlan(rows[0]) : null;
    }
    async listSubscriptionPlans(isActive = true) {
        const { rows } = await this.pool.query('SELECT * FROM plans WHERE is_active = $1 ORDER BY monthly_price', [isActive]);
        return rows.map(this.mapSubscriptionPlan);
    }
    // Restaurant Subscription Operations
    async createRestaurantSubscription(input, client) {
        const query = `
      INSERT INTO restaurant_subscriptions (
        restaurant_id, plan_id, start_date, end_date, status, payment_status, payment_reference
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
        const values = [
            input.restaurant_id,
            input.plan_id,
            input.start_date,
            input.end_date,
            input.status || 'active',
            input.payment_status || 'paid',
            input.payment_reference || null
        ];
        const { rows } = client ? await client.query(query, values) : await this.pool.query(query, values);
        return rows[0];
    }
    async getRestaurantSubscription(restaurantId) {
        const { rows } = await this.pool.query('SELECT * FROM restaurant_subscriptions WHERE restaurant_id = $1 AND status = $2', [restaurantId, 'active']);
        return rows[0] || null;
    }
    async updateRestaurantSubscription(restaurantId, data) {
        var _a;
        const query = `
      UPDATE restaurant_subscriptions 
      SET plan_id = $1, start_date = $2, end_date = $3, grace_period_days = $4, updated_at = CURRENT_TIMESTAMP 
      WHERE restaurant_id = $5 AND status = 'active'
    `;
        const result = await this.pool.query(query, [
            data.plan_id,
            data.start_date,
            data.end_date,
            data.grace_period_days,
            restaurantId
        ]);
        return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
    }
    // Restaurant Admin Operations
    async createRestaurantAdmin(input) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            // Check if restaurant exists
            const restaurant = await this.getRestaurantById(input.restaurant_id);
            if (!restaurant) {
                throw new Error('Restaurant not found');
            }
            // Hash password
            const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
            const hashedPassword = await bcrypt.hash(input.password, 10);
            // Create user
            const userQuery = `
        INSERT INTO users (name, email, password, role, restaurant_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;
            const userValues = [
                input.name,
                input.email,
                hashedPassword,
                'restaurant_admin',
                input.restaurant_id
            ];
            const { rows } = await client.query(userQuery, userValues);
            await client.query('COMMIT');
            return { id: rows[0].id };
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    // Helper Methods
    mapSubscriptionPlan(row) {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            monthly_price: row.monthly_price,
            yearly_price: row.yearly_price,
            is_active: row.is_active,
            created_at: row.created_at,
            updated_at: row.updated_at
        };
    }
    async getRestaurantSettings(restaurantId) {
        const query = `
      SELECT 
        rs.*,
        json_agg(
          json_build_object(
            'module_id', rmp.module_id,
            'module_name', m.name,
            'display_name', m.display_name,
            'category', m.category,
            'is_enabled', rmp.is_enabled
          )
        ) as module_permissions
      FROM restaurant_settings rs
      LEFT JOIN restaurant_module_permissions rmp ON rs.restaurant_id = rmp.restaurant_id
      LEFT JOIN modules m ON rmp.module_id = m.id
      WHERE rs.restaurant_id = $1
      GROUP BY rs.id, rs.restaurant_id, rs.max_outlets, rs.is_active, rs.created_at, rs.updated_at
    `;
        const { rows } = await this.pool.query(query, [restaurantId]);
        return rows[0] || null;
    }
    async updateRestaurantSettings(restaurantId, data) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            // Update restaurant settings
            const settingsQuery = `
        INSERT INTO restaurant_settings (restaurant_id, max_outlets, is_active)
        VALUES ($1, $2, true)
        ON CONFLICT (restaurant_id) 
        DO UPDATE SET max_outlets = $2, updated_at = CURRENT_TIMESTAMP
      `;
            await client.query(settingsQuery, [restaurantId, data.max_outlets]);
            // Update module permissions
            for (const permission of data.module_permissions) {
                const permissionQuery = `
          INSERT INTO restaurant_module_permissions (restaurant_id, module_id, is_enabled)
          VALUES ($1, $2, $3)
          ON CONFLICT (restaurant_id, module_id) 
          DO UPDATE SET is_enabled = $3, updated_at = CURRENT_TIMESTAMP
        `;
                await client.query(permissionQuery, [restaurantId, permission.module_id, permission.is_enabled]);
            }
            await client.query('COMMIT');
            return true;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
}
exports.RestaurantRepository = RestaurantRepository;
