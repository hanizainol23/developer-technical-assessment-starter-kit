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

    // Build WHERE clause conditions based on provided filters
    const keywordCondition = keyword.trim() ? 
      "(LOWER(name) LIKE $1 OR LOWER(details) LIKE $1)" : 
      "TRUE";
    const locationCondition = location.trim() ? 
      "(LOWER(location_city) LIKE $2 OR LOWER(location_neighborhood) LIKE $2)" : 
      "TRUE";

    // Build the SQL with dynamic conditions
    const whereClause = `WHERE ${keywordCondition} AND ${locationCondition}`;
    
    // Optimized query using UNION with indexed searches
    const sql = `
      SELECT id, 'property' as type, name, price, image_urls, location_city, location_neighborhood, sq_ft_or_area, created_at
      FROM properties
      ${whereClause}
      UNION ALL
      SELECT id, 'project' as type, name, NULL::numeric as price, image_urls, location_city, location_neighborhood, sq_ft_or_area, created_at
      FROM projects
      ${whereClause}
      UNION ALL
      SELECT id, 'land' as type, name, price, image_urls, location_city, location_neighborhood, sq_ft_or_area, created_at
      FROM lands
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $1
    `;

    // Prepare query parameters
    const queryParams: any[] = [limit];
    if (keyword.trim()) queryParams.push(searchKeyword);
    if (location.trim()) queryParams.push(searchLocation);

    const res = await this.db.query(sql, queryParams);
    return res.rows;
  }
}
