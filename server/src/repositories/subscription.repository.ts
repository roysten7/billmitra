import { Pool } from 'pg';
import { 
  Plan, 
  PlanModule, 
  Subscription, 
  CreatePlanInput, 
  UpdatePlanInput, 
  UpdatePlanModulesInput, 
  CreateSubscriptionInput, 
  UpdateSubscriptionInput,
  AVAILABLE_MODULES
} from '../types/subscription';
import { pool } from '../config/db';

export class SubscriptionRepository {
  constructor(private readonly pool: Pool) {}

  // Plan CRUD Operations
  async createPlan(input: CreatePlanInput): Promise<Plan> {
    const query = `
      INSERT INTO plans (name, monthly_price, yearly_price, description, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      input.name,
      input.monthly_price,
      input.yearly_price,
      input.description || null,
      input.is_active ?? true
    ];

    const result = await this.pool.query<Plan>(query, values);
    return result.rows[0];
  }

  async getPlanById(id: string): Promise<Plan | null> {
    const query = 'SELECT * FROM plans WHERE id = $1';
    const result = await this.pool.query<Plan>(query, [id]);
    return result.rows[0] || null;
  }

  async getAllPlans(activeOnly: boolean = true): Promise<Plan[]> {
    let query = 'SELECT * FROM plans';
    const values: any[] = [];
    
    if (activeOnly) {
      query += ' WHERE is_active = $1';
      values.push(true);
    }
    
    query += ' ORDER BY monthly_price ASC';
    const result = await this.pool.query<Plan>(query, values);
    return result.rows;
  }

  async updatePlan(input: UpdatePlanInput): Promise<Plan | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.monthly_price !== undefined) {
      fields.push(`monthly_price = $${paramIndex++}`);
      values.push(input.monthly_price);
    }
    if (input.yearly_price !== undefined) {
      fields.push(`yearly_price = $${paramIndex++}`);
      values.push(input.yearly_price);
    }
    if (input.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(input.description);
    }
    if (input.is_active !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(input.is_active);
    }

    if (fields.length === 0) {
      return this.getPlanById(input.id);
    }

    values.push(input.id);
    const query = `
      UPDATE plans
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query<Plan>(query, values);
    return result.rows[0] || null;
  }

  async deletePlan(id: string): Promise<boolean> {
    const query = 'DELETE FROM plans WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Plan Modules Operations
  async getPlanModules(planId: string): Promise<PlanModule[]> {
    const query = 'SELECT * FROM plan_modules WHERE plan_id = $1';
    const result = await this.pool.query<PlanModule>(query, [planId]);
    return result.rows;
  }

  async updatePlanModules(input: UpdatePlanModulesInput): Promise<PlanModule[]> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Delete existing modules for this plan
      await client.query('DELETE FROM plan_modules WHERE plan_id = $1', [input.plan_id]);
      
      // Insert new modules
      if (input.modules && input.modules.length > 0) {
        const values = input.modules.map(m => `(${input.plan_id}, '${m.name}', ${m.is_enabled})`).join(',');
        const insertQuery = `
          INSERT INTO plan_modules (plan_id, module_name, is_enabled)
          VALUES ${values}
          RETURNING *
        `;
        await client.query(insertQuery);
      }
      
      await client.query('COMMIT');
      
      // Return updated modules
      const result = await client.query<PlanModule>(
        'SELECT * FROM plan_modules WHERE plan_id = $1', 
        [input.plan_id]
      );
      
      return result.rows;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Subscription CRUD Operations
  async createSubscription(input: CreateSubscriptionInput): Promise<Subscription> {
    const query = `
      INSERT INTO subscriptions (restaurant_id, plan_id, start_date, end_date, is_active)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (restaurant_id) 
      DO UPDATE SET 
        plan_id = EXCLUDED.plan_id,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        is_active = EXCLUDED.is_active
      RETURNING *
    `;
    
    const values = [
      input.restaurant_id,
      input.plan_id,
      new Date(input.start_date),
      new Date(input.end_date),
      new Date(input.end_date) >= new Date() // Set is_active based on end_date
    ];

    const result = await this.pool.query<Subscription>(query, values);
    return result.rows[0];
  }

  async getSubscriptionByRestaurantId(restaurantId: string): Promise<Subscription | null> {
    const query = 'SELECT * FROM subscriptions WHERE restaurant_id = $1';
    const result = await this.pool.query<Subscription>(query, [restaurantId]);
    return result.rows[0] || null;
  }

  async updateSubscription(input: UpdateSubscriptionInput): Promise<Subscription | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.plan_id !== undefined) {
      fields.push(`plan_id = $${paramIndex++}`);
      values.push(input.plan_id);
    }
    if (input.end_date !== undefined) {
      fields.push(`end_date = $${paramIndex++}`);
      values.push(new Date(input.end_date));
    }
    if (input.is_active !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(input.is_active);
    }

    if (fields.length === 0) {
      const result = await this.pool.query<Subscription>(
        'SELECT * FROM subscriptions WHERE id = $1',
        [input.id]
      );
      return result.rows[0] || null;
    }

    // Update is_active based on end_date if end_date is being updated
    if (input.end_date !== undefined) {
      fields.push(`is_active = (end_date >= CURRENT_DATE)`);
    }

    values.push(input.id);
    const query = `
      UPDATE subscriptions
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query<Subscription>(query, values);
    return result.rows[0] || null;
  }

  async cancelSubscription(id: string): Promise<Subscription | null> {
    const query = `
      UPDATE subscriptions
      SET is_active = false
      WHERE id = $1
      RETURNING *
    `;
    const result = await this.pool.query<Subscription>(query, [id]);
    return result.rows[0] || null;
  }

  // Utility Methods
  async getRestaurantActiveModules(restaurantId: string): Promise<string[]> {
    const query = `
      SELECT pm.module_name
      FROM subscriptions s
      JOIN plan_modules pm ON s.plan_id = pm.plan_id
      WHERE s.restaurant_id = $1 
        AND s.is_active = true 
        AND pm.is_enabled = true
        AND s.end_date >= CURRENT_DATE
    `;
    const result = await this.pool.query<{module_name: string}>(query, [restaurantId]);
    return result.rows.map(row => row.module_name);
  }

  async isModuleEnabled(restaurantId: string, moduleName: string): Promise<boolean> {
    const query = `
      SELECT 1
      FROM subscriptions s
      JOIN plan_modules pm ON s.plan_id = pm.plan_id
      WHERE s.restaurant_id = $1 
        AND s.is_active = true 
        AND pm.module_name = $2
        AND pm.is_enabled = true
        AND s.end_date >= CURRENT_DATE
      LIMIT 1
    `;
    const result = await this.pool.query(query, [restaurantId, moduleName]);
    return (result.rowCount ?? 0) > 0;
  }
}

export const subscriptionRepository = new SubscriptionRepository(pool);
