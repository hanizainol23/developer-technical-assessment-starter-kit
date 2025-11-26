#!/usr/bin/env node
/**
 * Database seeding script
 * Generates synthetic data for projects, properties, and lands (1K+ records)
 * Run inside the devcontainer where the DB host is `db` or locally by setting DATABASE_URL
 *
 * Usage:
 *   NODE_ENV=development node Projects/database/seed.js
 * or
 *   DATABASE_URL=postgres://postgres:postgres@db:5432/postgres node Projects/database/seed.js
 */

const { Pool } = require('pg');

const DEFAULT_DB = process.env.DATABASE_URL || 'postgres://postgres:postgres@db:5432/postgres';
const pool = new Pool({ connectionString: DEFAULT_DB });

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choose(arr) {
  return arr[randInt(0, arr.length - 1)];
}

const cities = ['Seaside', 'Hillside', 'Downtown', 'Uptown', 'Riverside', 'Outskirts', 'Central City', 'Green Valley'];
const neighborhoods = ['Coastline', 'Green Estates', 'Old Quarter', 'Lakeview', 'Sunny Park', 'Main Road', 'Quiet Neighborhood', 'Market District'];
const adjectives = ['Cozy', 'Spacious', 'Modern', 'Charming', 'Luxurious', 'Affordable', 'Bright', 'Elegant', 'Renovated', 'Classic'];
const propertyTypes = ['Apartment', 'House', 'Villa', 'Studio', 'Townhouse'];

function mkName() {
  return `${choose(adjectives)} ${choose(propertyTypes)}`;
}

function mkDetails() {
  const sentences = [
    'Close to public transport and amenities.',
    'Great natural light and modern finishes.',
    'Quiet street with friendly neighbors.',
    'Large backyard and private parking.',
    'Open-plan living and recently renovated kitchen.',
    'Walking distance to schools and parks.',
    'Sea views from the balcony.',
    'Secure gated community with 24/7 security.'
  ];
  const count = randInt(1, 3);
  let out = '';
  for (let i = 0; i < count; i++) out += choose(sentences) + ' ';
  return out.trim();
}

function mkImageUrls() {
  // reuse placeholder sample images, but generate slightly varied names
  const imgs = ['/sample data/images/properties/property1.jpg', '/sample data/images/properties/property2.jpg'];
  const n = randInt(1, 4);
  const out = [];
  for (let i = 0; i < n; i++) out.push(choose(imgs));
  return JSON.stringify(out);
}

async function insertProjects(targetCount) {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id FROM projects');
    const existing = res.rows.map(r => r.id);
    const toCreate = Math.max(0, targetCount - existing.length);
    const createdIds = [];
    for (let i = 0; i < toCreate; i++) {
      const name = `Project ${Date.now().toString().slice(-5)}-${i}`;
      const image_urls = mkImageUrls();
      const price_range = `${randInt(50, 300)}k - ${randInt(301, 800)}k`;
      const location_city = choose(cities);
      const location_neighborhood = choose(neighborhoods);
      const details = mkDetails();
      const sq_ft_or_area = randInt(50, 1000);
      const q = await client.query(
        'INSERT INTO projects (name, image_urls, price_range, location_city, location_neighborhood, details, sq_ft_or_area) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
        [name, image_urls, price_range, location_city, location_neighborhood, details, sq_ft_or_area]
      );
      createdIds.push(q.rows[0].id);
    }
    return existing.concat(createdIds);
  } finally {
    client.release();
  }
}

async function batchInsertProperties(total, projectIds) {
  const client = await pool.connect();
  const batch = 100;
  try {
    for (let offset = 0; offset < total; offset += batch) {
      const slice = Math.min(batch, total - offset);
      const vals = [];
      const params = [];
      let idx = 1;
      for (let i = 0; i < slice; i++) {
        const name = mkName() + ' ' + (offset + i + 1);
        const image_urls = mkImageUrls();
        const price = (randInt(30, 500) * 1000).toFixed(2);
        const price_range = null;
        const location_city = choose(cities);
        const location_neighborhood = choose(neighborhoods);
        const details = mkDetails();
        const sq_ft_or_area = randInt(30, 800);
        const project_id = choose(projectIds);
        vals.push(`($${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++})`);
        params.push(name, image_urls, price, price_range, location_city, location_neighborhood, details, sq_ft_or_area, project_id);
      }
      const sql = `INSERT INTO properties (name,image_urls,price,price_range,location_city,location_neighborhood,details,sq_ft_or_area,project_id) VALUES ${vals.join(',')}`;
      await client.query(sql, params);
      console.log(`Inserted properties ${offset + 1}..${offset + slice}`);
    }
  } finally {
    client.release();
  }
}

async function batchInsertLands(total) {
  const client = await pool.connect();
  const batch = 100;
  try {
    for (let offset = 0; offset < total; offset += batch) {
      const slice = Math.min(batch, total - offset);
      const vals = [];
      const params = [];
      let idx = 1;
      for (let i = 0; i < slice; i++) {
        const name = `Land Plot ${Date.now().toString().slice(-5)}-${offset + i + 1}`;
        const image_urls = mkImageUrls();
        const price = (randInt(10, 200) * 1000).toFixed(2);
        const price_range = null;
        const location_city = choose(cities);
        const location_neighborhood = choose(neighborhoods);
        const details = mkDetails();
        const sq_ft_or_area = randInt(100, 2000);
        vals.push(`($${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++})`);
        params.push(name, image_urls, price, price_range, location_city, location_neighborhood, details, sq_ft_or_area);
      }
      const sql = `INSERT INTO lands (name,image_urls,price,price_range,location_city,location_neighborhood,details,sq_ft_or_area) VALUES ${vals.join(',')}`;
      await client.query(sql, params);
      console.log(`Inserted lands ${offset + 1}..${offset + slice}`);
    }
  } finally {
    client.release();
  }
}

async function main() {
  console.log('Connecting to', DEFAULT_DB);
  try {
    // target counts
    const targetProjects = 200;
    const targetProperties = 800;
    const targetLands = 200;

    const projectIds = await insertProjects(targetProjects);
    console.log('Projects total ids count:', projectIds.length);

    await batchInsertProperties(targetProperties, projectIds);
    await batchInsertLands(targetLands);

    console.log('Seeding complete');
  } catch (err) {
    console.error('Seeding error', err);
  } finally {
    await pool.end();
  }
}

main();
