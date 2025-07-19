import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db = null;

export async function getDatabase() {
  if (!db) {
    db = await open({
      filename: path.join(process.cwd(), 'database/rfq.db'),
      driver: sqlite3.Database,
    });

    // Create tables if they don't exist
    await initializeTables();
  }
  return db;
}

async function initializeTables() {
  const db = await getDatabase();

  // RFQs table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS rfqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'Planning',
      created_date DATE NOT NULL,
      deadline DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Allocations table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS allocations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rfq_id INTEGER NOT NULL,
      engineer_name TEXT,
      level TEXT NOT NULL,
      location TEXT NOT NULL,
      role TEXT NOT NULL,
      feature TEXT NOT NULL,
      custom_feature TEXT,
      allocation_type TEXT DEFAULT 'Whole Project',
      fte_percentage INTEGER DEFAULT 100,
      start_date DATE,
      end_date DATE,
      monthly_fte TEXT, -- JSON string for monthly FTE data
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (rfq_id) REFERENCES rfqs (id) ON DELETE CASCADE
    )
  `);

  // Engineer rates table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS engineer_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT NOT NULL,
      location TEXT NOT NULL,
      rate DECIMAL(10,2) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(level, location)
    )
  `);

  // Settings table for various configurations
  await db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL, -- JSON string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default engineer rates if they don't exist
  await insertDefaultRates();
  await insertDefaultSettings();
}

async function insertDefaultRates() {
  const db = await getDatabase();
  
  const defaultRates = [
    { level: 'Junior', location: 'HCC', rate: 45 },
    { level: 'Junior', location: 'BCC', rate: 35 },
    { level: 'Junior', location: 'MCC', rate: 25 },
    { level: 'Standard', location: 'HCC', rate: 60 },
    { level: 'Standard', location: 'BCC', rate: 50 },
    { level: 'Standard', location: 'MCC', rate: 35 },
    { level: 'Senior', location: 'HCC', rate: 80 },
    { level: 'Senior', location: 'BCC', rate: 65 },
    { level: 'Senior', location: 'MCC', rate: 50 },
    { level: 'Principal', location: 'HCC', rate: 100 },
    { level: 'Principal', location: 'BCC', rate: 80 },
    { level: 'Principal', location: 'MCC', rate: 65 },
    { level: 'Technical Leader', location: 'HCC', rate: 120 },
    { level: 'Technical Leader', location: 'BCC', rate: 95 },
    { level: 'Technical Leader', location: 'MCC', rate: 75 },
    { level: 'FO', location: 'HCC', rate: 140 },
    { level: 'FO', location: 'BCC', rate: 110 },
    { level: 'FO', location: 'MCC', rate: 85 }
  ];

  for (const rate of defaultRates) {
    await db.run(`
      INSERT OR IGNORE INTO engineer_rates (level, location, rate)
      VALUES (?, ?, ?)
    `, [rate.level, rate.location, rate.rate]);
  }
}

async function insertDefaultSettings() {
  const db = await getDatabase();
  
  const defaultSettings = [
    {
      key: 'tm_sell_rates',
      value: JSON.stringify({
        HCC: 120,
        BCC: 95,
        MCC: 75
      })
    },
    {
      key: 'wp_config',
      value: JSON.stringify({
        storyPointsToHours: 8,
        hardwareCostPerHour: 5,
        riskFactor: 15,
        tickets: {
          small: { storyPoints: 5, price: 2500, quotePercentage: 25 },
          medium: { storyPoints: 13, price: 6500, quotePercentage: 25 },
          large: { storyPoints: 21, price: 12000, quotePercentage: 50 }
        }
      })
    }
  ];

  for (const setting of defaultSettings) {
    await db.run(`
      INSERT OR IGNORE INTO settings (key, value)
      VALUES (?, ?)
    `, [setting.key, setting.value]);
  }
}

// RFQ database operations
export async function getAllRfqs() {
  const db = await getDatabase();
  const rfqs = await db.all('SELECT * FROM rfqs ORDER BY created_at DESC');
  
  // Get allocations for each RFQ
  for (const rfq of rfqs) {
    const allocations = await db.all(
      'SELECT * FROM allocations WHERE rfq_id = ? ORDER BY id',
      [rfq.id]
    );
    
    // Parse monthly_fte JSON for each allocation
    rfq.allocations = allocations.map(allocation => ({
      ...allocation,
      monthlyFTE: allocation.monthly_fte ? JSON.parse(allocation.monthly_fte) : {}
    }));
  }
  
  return rfqs;
}

export async function createRfq(rfqData) {
  const db = await getDatabase();
  const result = await db.run(`
    INSERT INTO rfqs (name, status, created_date, deadline)
    VALUES (?, ?, ?, ?)
  `, [rfqData.name, rfqData.status, rfqData.createdDate, rfqData.deadline]);
  
  const newRfq = await db.get('SELECT * FROM rfqs WHERE id = ?', [result.lastID]);
  newRfq.allocations = [];
  return newRfq;
}

export async function updateRfq(id, updates) {
  const db = await getDatabase();
  
  const setClause = Object.keys(updates)
    .filter(key => key !== 'allocations')
    .map(key => `${key} = ?`)
    .join(', ');
  
  const values = Object.keys(updates)
    .filter(key => key !== 'allocations')
    .map(key => updates[key]);
  
  if (setClause) {
    await db.run(`
      UPDATE rfqs SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [...values, id]);
  }
  
  // Handle allocations separately
  if (updates.allocations) {
    // Delete existing allocations
    await db.run('DELETE FROM allocations WHERE rfq_id = ?', [id]);
    
    // Insert new allocations
    for (const allocation of updates.allocations) {
      await db.run(`
        INSERT INTO allocations (
          rfq_id, engineer_name, level, location, role, feature, custom_feature,
          allocation_type, fte_percentage, start_date, end_date, monthly_fte
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        allocation.name,
        allocation.level,
        allocation.location,
        allocation.role,
        allocation.feature,
        allocation.customFeature,
        allocation.allocationType,
        allocation.ftePercentage,
        allocation.startDate,
        allocation.endDate,
        JSON.stringify(allocation.monthlyFTE)
      ]);
    }
  }
  
  // Return updated RFQ with allocations
  const updatedRfq = await db.get('SELECT * FROM rfqs WHERE id = ?', [id]);
  const allocations = await db.all('SELECT * FROM allocations WHERE rfq_id = ?', [id]);
  updatedRfq.allocations = allocations.map(allocation => ({
    ...allocation,
    name: allocation.engineer_name,
    monthlyFTE: allocation.monthly_fte ? JSON.parse(allocation.monthly_fte) : {}
  }));
  
  return updatedRfq;
}

export async function deleteRfq(id) {
  const db = await getDatabase();
  await db.run('DELETE FROM rfqs WHERE id = ?', [id]);
}

// Settings operations
export async function getSettings() {
  const db = await getDatabase();
  const settings = await db.all('SELECT * FROM settings');
  const engineerRates = await db.all('SELECT * FROM engineer_rates');
  
  // Convert engineer rates to nested object
  const ratesObject = {};
  for (const rate of engineerRates) {
    if (!ratesObject[rate.level]) {
      ratesObject[rate.level] = {};
    }
    ratesObject[rate.level][rate.location] = rate.rate;
  }
  
  // Convert settings to object
  const settingsObject = {};
  for (const setting of settings) {
    settingsObject[setting.key] = JSON.parse(setting.value);
  }
  
  return {
    engineerRates: ratesObject,
    tmSellRates: settingsObject.tm_sell_rates || {},
    wpConfig: settingsObject.wp_config || {}
  };
}

export async function updateSettings(settingsData) {
  const db = await getDatabase();
  
  // Update engineer rates
  if (settingsData.engineerRates) {
    for (const [level, locations] of Object.entries(settingsData.engineerRates)) {
      for (const [location, rate] of Object.entries(locations)) {
        await db.run(`
          INSERT OR REPLACE INTO engineer_rates (level, location, rate, updated_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `, [level, location, rate]);
      }
    }
  }
  
  // Update other settings
  if (settingsData.tmSellRates) {
    await db.run(`
      INSERT OR REPLACE INTO settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, ['tm_sell_rates', JSON.stringify(settingsData.tmSellRates)]);
  }
  
  if (settingsData.wpConfig) {
    await db.run(`
      INSERT OR REPLACE INTO settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, ['wp_config', JSON.stringify(settingsData.wpConfig)]);
  }
}