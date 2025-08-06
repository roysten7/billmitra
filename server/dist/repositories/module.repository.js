"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleRepository = void 0;
class ModuleRepository {
    constructor(pool) {
        this.pool = pool;
    }
    // Module CRUD Operations
    async createModule(input) {
        var _a;
        const result = await this.pool.query(`INSERT INTO modules (name, display_name, description, category, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [input.name, input.display_name, input.description, input.category, (_a = input.is_active) !== null && _a !== void 0 ? _a : true]);
        return result.rows[0];
    }
    async getModuleById(id) {
        const result = await this.pool.query('SELECT * FROM modules WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    async updateModule(id, updates) {
        const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
        const values = Object.values(updates);
        const result = await this.pool.query(`UPDATE modules SET ${fields}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`, [id, ...values]);
        return result.rows[0] || null;
    }
    async deleteModule(id) {
        var _a;
        const result = await this.pool.query('DELETE FROM modules WHERE id = $1', [id]);
        return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
    }
    async listModules(activeOnly = true) {
        let query = 'SELECT * FROM modules';
        const params = [];
        if (activeOnly) {
            query += ' WHERE is_active = true';
        }
        query += ' ORDER BY category, display_name';
        const result = await this.pool.query(query, params);
        return result.rows;
    }
    // Restaurant Settings Operations
    async createRestaurantSettings(restaurantId, maxOutlets = 1) {
        const result = await this.pool.query(`INSERT INTO restaurant_settings (restaurant_id, max_outlets)
       VALUES ($1, $2)
       RETURNING *`, [restaurantId, maxOutlets]);
        return result.rows[0];
    }
    async getRestaurantSettings(restaurantId) {
        const result = await this.pool.query('SELECT * FROM restaurant_settings WHERE restaurant_id = $1', [restaurantId]);
        return result.rows[0] || null;
    }
    async updateRestaurantSettings(restaurantId, updates) {
        const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
        const values = Object.values(updates);
        const result = await this.pool.query(`UPDATE restaurant_settings SET ${fields}, updated_at = CURRENT_TIMESTAMP
       WHERE restaurant_id = $1
       RETURNING *`, [restaurantId, ...values]);
        return result.rows[0] || null;
    }
    // Restaurant Module Permissions Operations
    async getRestaurantModulePermissions(restaurantId) {
        const result = await this.pool.query(`SELECT rmp.*, m.name as module_name, m.display_name, m.description, m.category
       FROM restaurant_module_permissions rmp
       JOIN modules m ON rmp.module_id = m.id
       WHERE rmp.restaurant_id = $1
       ORDER BY m.category, m.display_name`, [restaurantId]);
        return result.rows;
    }
    async updateRestaurantModulePermissions(restaurantId, permissions, client) {
        const db = client || this.pool;
        // Delete existing permissions
        await db.query('DELETE FROM restaurant_module_permissions WHERE restaurant_id = $1', [restaurantId]);
        // Insert new permissions
        for (const permission of permissions) {
            await db.query(`INSERT INTO restaurant_module_permissions (restaurant_id, module_id, is_enabled)
         VALUES ($1, $2, $3)`, [restaurantId, permission.module_id, permission.is_enabled]);
        }
    }
    async getRestaurantWithSettingsAndPermissions(restaurantId) {
        const result = await this.pool.query(`SELECT 
        r.*,
        rs.max_outlets,
        rs.is_active as settings_active,
        json_agg(
          json_build_object(
            'module_id', m.id,
            'module_name', m.name,
            'display_name', m.display_name,
            'category', m.category,
            'is_enabled', COALESCE(rmp.is_enabled, false)
          )
        ) as module_permissions
       FROM restaurants r
       LEFT JOIN restaurant_settings rs ON r.id = rs.restaurant_id
       LEFT JOIN modules m ON m.is_active = true
       LEFT JOIN restaurant_module_permissions rmp ON r.id = rmp.restaurant_id AND m.id = rmp.module_id
       WHERE r.id = $1
       GROUP BY r.id, rs.max_outlets, rs.is_active`, [restaurantId]);
        return result.rows[0] || null;
    }
}
exports.ModuleRepository = ModuleRepository;
