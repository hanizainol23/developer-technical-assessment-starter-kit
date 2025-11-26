import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ListingsService {
  constructor(private db: DatabaseService) {}

  // Fetch top N popular items across properties, projects, lands using UNION
  async popular(limit = 6) {
    // Using price as a proxy for popularity (highest price first). Adjust as needed.
    const sql = `
      SELECT id, 'property' as type, name, price, image_urls, location_city, location_neighborhood, sq_ft_or_area
      FROM properties
      WHERE price IS NOT NULL
      UNION ALL
      SELECT id, 'project' as type, name, NULL::numeric as price, image_urls, location_city, location_neighborhood, sq_ft_or_area
      FROM projects
      UNION ALL
      SELECT id, 'land' as type, name, price, image_urls, location_city, location_neighborhood, sq_ft_or_area
      FROM lands
      ORDER BY price DESC NULLS LAST
      LIMIT $1
    `;
    const res = await this.db.query(sql, [limit]);
    return res.rows;
  }

  // Search across all listings by keyword and/or location
  async search(keyword: string = '', location: string = '', limit: number = 20) {
    // Sanitize and normalize inputs
    const searchKeyword = `%${keyword.trim()}%`.toLowerCase();
    const searchLocation = `%${location.trim()}%`.toLowerCase();
    const hasKeyword = keyword.trim().length > 0;
    const hasLocation = location.trim().length > 0;

    let paramIndex = 1;
    const queryParams: any[] = [];
    
    // Build WHERE clause conditions based on provided filters
    let keywordCondition = 'TRUE';
    if (hasKeyword) {
      keywordCondition = `(LOWER(name) LIKE $${paramIndex} OR LOWER(details) LIKE $${paramIndex})`;
      queryParams.push(searchKeyword);
      paramIndex++;
    }
    
    let locationCondition = 'TRUE';
    if (hasLocation) {
      locationCondition = `(LOWER(location_city) LIKE $${paramIndex} OR LOWER(location_neighborhood) LIKE $${paramIndex})`;
      queryParams.push(searchLocation);
      paramIndex++;
    }

    const limitParamIndex = paramIndex;
    queryParams.push(limit);

    // Build the SQL with dynamic conditions
    const whereClause = `WHERE ${keywordCondition} AND ${locationCondition}`;
    
    // Optimized query using UNION with indexed searches
    const sql = `
      SELECT id, 'property' as type, name, price, image_urls, location_city, location_neighborhood, sq_ft_or_area
      FROM properties
      ${whereClause}
      UNION ALL
      SELECT id, 'project' as type, name, NULL::numeric as price, image_urls, location_city, location_neighborhood, sq_ft_or_area
      FROM projects
      ${whereClause}
      UNION ALL
      SELECT id, 'land' as type, name, price, image_urls, location_city, location_neighborhood, sq_ft_or_area
      FROM lands
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${limitParamIndex}
    `;

    const res = await this.db.query(sql, queryParams);
    return res.rows;
  }
}
