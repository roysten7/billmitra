import { pool } from '../config/db';
import { RestaurantRepository } from '../repositories/restaurant.repository';
import { CreateRestaurantWithSubscriptionInput } from '../types/restaurant';
import bcrypt from 'bcryptjs';

const restaurantRepo = new RestaurantRepository(pool);

export class RestaurantService {
  static async createRestaurantWithSubscription(
    input: CreateRestaurantWithSubscriptionInput,
    createdByUserId: number
  ) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 1. Create restaurant
      const restaurant = await restaurantRepo.createRestaurant(
        {
          name: input.name,
          description: input.description,
          address: input.address,
          city: input.city,
          state: input.state,
          country: input.country,
          postal_code: input.postal_code,
          phone: input.phone,
          email: input.email,
          website: input.website,
          timezone: input.timezone || 'Asia/Kolkata',
        },
        createdByUserId,
        client
      );
      
      // 2. Create restaurant subscription
      const subscription = await restaurantRepo.createRestaurantSubscription(
        {
          restaurant_id: restaurant.id,
          plan_id: input.plan_id,
          start_date: new Date(input.start_date),
          end_date: new Date(input.end_date),
          grace_period_days: input.grace_period_days || 7,
          status: 'active',
          payment_status: 'paid',
        },
        client
      );
      
      // 3. Create restaurant admin user
      const hashedPassword = await bcrypt.hash(input.admin_password, 12);
      
      const adminUser = await client.query(
        `INSERT INTO users (name, email, password, role, restaurant_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, name, email, role, restaurant_id`,
        [input.admin_name, input.admin_email, hashedPassword, 'restaurant_admin', restaurant.id]
      );
      
      await client.query('COMMIT');
      
      return {
        restaurant,
        subscription,
        admin: adminUser.rows[0],
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  static async getRestaurantsWithDetails(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    
    const result = await pool.query(`
      SELECT 
        r.*,
        rs.start_date,
        rs.end_date,
        rs.grace_period_days,
        rs.status as subscription_status,
        sp.name as plan_name,
        sp.monthly_price as plan_price,
        u.name as admin_name,
        u.email as admin_email
      FROM restaurants r
      LEFT JOIN restaurant_subscriptions rs ON r.id = rs.restaurant_id AND rs.status = 'active'
      LEFT JOIN plans sp ON rs.plan_id = sp.id
      LEFT JOIN users u ON r.id = u.restaurant_id AND u.role = 'restaurant_admin'
      ORDER BY r.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    return result.rows;
  }
  
  static async getRestaurantWithDetails(restaurantId: number) {
    const result = await pool.query(`
      SELECT 
        r.*,
        rs.start_date,
        rs.end_date,
        rs.grace_period_days,
        rs.status as subscription_status,
        sp.name as plan_name,
        sp.monthly_price as plan_price,
        sp.description as plan_description,
        u.name as admin_name,
        u.email as admin_email
      FROM restaurants r
      LEFT JOIN restaurant_subscriptions rs ON r.id = rs.restaurant_id AND rs.status = 'active'
      LEFT JOIN plans sp ON rs.plan_id = sp.id
      LEFT JOIN users u ON r.id = u.restaurant_id AND u.role = 'restaurant_admin'
      WHERE r.id = $1
    `, [restaurantId]);
    
    return result.rows[0] || null;
  }
} 