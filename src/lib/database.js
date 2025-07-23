// src/lib/database.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;
export async function initDb() {
  if (!db) {
    db = await open({
      filename: process.env.DB_FILE || './database/rfq.db',
      driver: sqlite3.Database
    });

    // Extend RFQ table with workflow columns
    await db.exec(`
      CREATE TABLE IF NOT EXISTS rfqs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        created_by TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        approved_by TEXT,
        approval_date TEXT,
        rejection_reason TEXT
      );
    `);

    // Audit trail for approvals/rejections
    await db.exec(`
      CREATE TABLE IF NOT EXISTS rfq_approvals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rfq_id TEXT NOT NULL,
        action TEXT NOT NULL,              -- 'submit' | 'approve' | 'reject'
        user_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        reason TEXT,                       -- only for 'reject'
        FOREIGN KEY (rfq_id) REFERENCES rfqs(id)
      );
    `);
  }
  return db;
}

// Basic fetchers
export async function getAllRfqs() {
  const db = await initDb();
  return db.all(`SELECT * FROM rfqs`);
}
export async function getRfqById(id) {
  const db = await initDb();
  return db.get(`SELECT * FROM rfqs WHERE id = ?`, id);
}

// Create
export async function createRfq(data, userId) {
  const db = await initDb();
  const now = new Date().toISOString();
  await db.run(
    `INSERT INTO rfqs (id, title, description, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    data.id, data.title, data.description || '', userId, now, now
  );
  return getRfqById(data.id);
}

// Update (only in draft/rejected or Admin)
export async function updateRfq(id, updates, userRole) {
  const db = await initDb();
  const existing = await getRfqById(id);
  if (!existing) throw new Error('RFQ not found');
  if (!['draft','rejected'].includes(existing.status) && userRole !== 'Admin') {
    throw new Error(`Cannot edit RFQ in status "${existing.status}"`);
  }
  const now = new Date().toISOString();
  const fields = Object.keys(updates);
  const setSQL = fields.map(f => `${f} = ?`).join(', ') + ', updated_at = ?';
  await db.run(
    `UPDATE rfqs SET ${setSQL} WHERE id = ?`,
    ...fields.map(f => updates[f]), now, id
  );
  return getRfqById(id);
}

// Delete (Admin-only for approved)
export async function deleteRfq(id, userRole) {
  const db = await initDb();
  const existing = await getRfqById(id);
  if (existing.status === 'approved' && userRole !== 'Admin') {
    throw new Error('Cannot delete approved RFQ');
  }
  await db.run(`DELETE FROM rfqs WHERE id = ?`, id);
  return { success: true };
}

// ---- Workflow methods ----
export async function submitRfq(id, userId) {
  const db = await initDb();
  const now = new Date().toISOString();
  await db.run(
    `UPDATE rfqs SET status = ?, updated_at = ? WHERE id = ?`,
    'submitted', now, id
  );
  await db.run(
    `INSERT INTO rfq_approvals (rfq_id, action, user_id, timestamp)
     VALUES (?, 'submit', ?, ?)`,
    id, userId, now
  );
  return getRfqById(id);
}

export async function approveRfq(id, userId) {
  const db = await initDb();
  const now = new Date().toISOString();
  await db.run(
    `UPDATE rfqs SET status = ?, approved_by = ?, approval_date = ?, updated_at = ?
     WHERE id = ?`,
    'approved', userId, now, now, id
  );
  await db.run(
    `INSERT INTO rfq_approvals (rfq_id, action, user_id, timestamp)
     VALUES (?, 'approve', ?, ?)`,
    id, userId, now
  );
  return getRfqById(id);
}

export async function rejectRfq(id, userId, reason) {
  const db = await initDb();
  const now = new Date().toISOString();
  await db.run(
    `UPDATE rfqs SET status = ?, rejection_reason = ?, updated_at = ?
     WHERE id = ?`,
    'rejected', reason, now, id
  );
  await db.run(
    `INSERT INTO rfq_approvals (rfq_id, action, user_id, timestamp, reason)
     VALUES (?, 'reject', ?, ?, ?)`,
    id, userId, now, reason
  );
  return getRfqById(id);
}
