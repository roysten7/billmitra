import { Pool } from 'pg';
import { 
  Outlet, 
  CreateOutletInput, 
  UpdateOutletInput 
} from '../types/outlet';

export class OutletRepository {
  constructor(private pool: Pool) {}

  async createOutlet(input: CreateOutletInput): Promise<Outlet> {
    const query = `
      INSERT INTO outlets (
        restaurant_id, name, alias, email, landmark, zip_code, fax, tin_no,
        country, state, city, timezone, address, area, latitude, longitude,
        additional_info, cuisines, seating_capacity, logo_url, images,
        restaurant_type, online_order_channels, code, fssai_lic_no,
        tax_authority_name, outlet_serving_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
      RETURNING *
    `;
    
    const values = [
      input.restaurant_id,
      input.name,
      input.alias || null,
      input.email || null,
      input.landmark || null,
      input.zip_code,
      input.fax || null,
      input.tin_no || null,
      input.country,
      input.state,
      input.city,
      input.timezone || 'Asia/Kolkata',
      input.address,
      input.area || null,
      input.latitude,
      input.longitude,
      input.additional_info || null,
      input.cuisines || null,
      input.seating_capacity || '1-10',
      input.logo_url || null,
      input.images ? JSON.stringify(input.images) : null,
      input.restaurant_type || 'Fine Dine',
      input.online_order_channels ? JSON.stringify(input.online_order_channels) : null,
      input.code || null,
      input.fssai_lic_no || null,
      input.tax_authority_name,
      input.outlet_serving_type || 'Service'
    ];

    const { rows } = await this.pool.query<Outlet>(query, values);
    return rows[0];
  }

  async getOutletsByRestaurant(restaurantId: number): Promise<Outlet[]> {
    const query = `
      SELECT * FROM outlets 
      WHERE restaurant_id = $1 AND is_active = true 
      ORDER BY created_at DESC
    `;
    
    const { rows } = await this.pool.query<Outlet>(query, [restaurantId]);
    return rows;
  }

  async getOutletById(id: number): Promise<Outlet | null> {
    const query = 'SELECT * FROM outlets WHERE id = $1 AND is_active = true';
    const { rows } = await this.pool.query<Outlet>(query, [id]);
    return rows[0] || null;
  }

  async updateOutlet(id: number, updates: UpdateOutletInput): Promise<Outlet | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.alias !== undefined) {
      fields.push(`alias = $${paramIndex++}`);
      values.push(updates.alias);
    }
    if (updates.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(updates.email);
    }
    if (updates.landmark !== undefined) {
      fields.push(`landmark = $${paramIndex++}`);
      values.push(updates.landmark);
    }
    if (updates.zip_code !== undefined) {
      fields.push(`zip_code = $${paramIndex++}`);
      values.push(updates.zip_code);
    }
    if (updates.fax !== undefined) {
      fields.push(`fax = $${paramIndex++}`);
      values.push(updates.fax);
    }
    if (updates.tin_no !== undefined) {
      fields.push(`tin_no = $${paramIndex++}`);
      values.push(updates.tin_no);
    }
    if (updates.country !== undefined) {
      fields.push(`country = $${paramIndex++}`);
      values.push(updates.country);
    }
    if (updates.state !== undefined) {
      fields.push(`state = $${paramIndex++}`);
      values.push(updates.state);
    }
    if (updates.city !== undefined) {
      fields.push(`city = $${paramIndex++}`);
      values.push(updates.city);
    }
    if (updates.timezone !== undefined) {
      fields.push(`timezone = $${paramIndex++}`);
      values.push(updates.timezone);
    }
    if (updates.address !== undefined) {
      fields.push(`address = $${paramIndex++}`);
      values.push(updates.address);
    }
    if (updates.area !== undefined) {
      fields.push(`area = $${paramIndex++}`);
      values.push(updates.area);
    }
    if (updates.latitude !== undefined) {
      fields.push(`latitude = $${paramIndex++}`);
      values.push(updates.latitude);
    }
    if (updates.longitude !== undefined) {
      fields.push(`longitude = $${paramIndex++}`);
      values.push(updates.longitude);
    }
    if (updates.additional_info !== undefined) {
      fields.push(`additional_info = $${paramIndex++}`);
      values.push(updates.additional_info);
    }
    if (updates.cuisines !== undefined) {
      fields.push(`cuisines = $${paramIndex++}`);
      values.push(updates.cuisines);
    }
    if (updates.seating_capacity !== undefined) {
      fields.push(`seating_capacity = $${paramIndex++}`);
      values.push(updates.seating_capacity);
    }
    if (updates.logo_url !== undefined) {
      fields.push(`logo_url = $${paramIndex++}`);
      values.push(updates.logo_url);
    }
    if (updates.images !== undefined) {
      fields.push(`images = $${paramIndex++}`);
      values.push(JSON.stringify(updates.images));
    }
    if (updates.restaurant_type !== undefined) {
      fields.push(`restaurant_type = $${paramIndex++}`);
      values.push(updates.restaurant_type);
    }
    if (updates.online_order_channels !== undefined) {
      fields.push(`online_order_channels = $${paramIndex++}`);
      values.push(JSON.stringify(updates.online_order_channels));
    }
    if (updates.code !== undefined) {
      fields.push(`code = $${paramIndex++}`);
      values.push(updates.code);
    }
    if (updates.fssai_lic_no !== undefined) {
      fields.push(`fssai_lic_no = $${paramIndex++}`);
      values.push(updates.fssai_lic_no);
    }
    if (updates.tax_authority_name !== undefined) {
      fields.push(`tax_authority_name = $${paramIndex++}`);
      values.push(updates.tax_authority_name);
    }
    if (updates.outlet_serving_type !== undefined) {
      fields.push(`outlet_serving_type = $${paramIndex++}`);
      values.push(updates.outlet_serving_type);
    }
    if (updates.is_active !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(updates.is_active);
    }

    if (fields.length === 0) {
      return this.getOutletById(id);
    }

    values.push(id);
    const query = `
      UPDATE outlets
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query<Outlet>(query, values);
    return result.rows[0] || null;
  }

  async deleteOutlet(id: number): Promise<boolean> {
    const query = 'UPDATE outlets SET is_active = false WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async getOutletCountByRestaurant(restaurantId: number): Promise<number> {
    const query = 'SELECT COUNT(*) FROM outlets WHERE restaurant_id = $1 AND is_active = true';
    const { rows } = await this.pool.query(query, [restaurantId]);
    return parseInt(rows[0].count);
  }
} 