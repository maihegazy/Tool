// scripts/testAddRfq.js
import path from 'path';
console.log('➡️ Using DB file at:', path.join(process.cwd(), 'database', 'rfq.db'));
import { createRfq, getAllRfqs } from '../src/lib/database.js';

async function main() {
  try {
    // 1) Insert a new RFQ
    const rfqToAdd = {
      name:        '🧪 Test RFQ Add',
      status:      'Planning',
      createdDate: '2025-07-16',
      deadline:    '2025-09-30'
    };
    const newRfq = await createRfq(rfqToAdd);
    console.log('✅ Created RFQ:', newRfq);

    // 2) Fetch all RFQs to verify
    const all = await getAllRfqs();
    console.log('📦 All RFQs now in DB:');
    console.table(all.map(r => ({
      id:          r.id,
      name:        r.name,
      status:      r.status,
      createdDate: r.created_date || r.createdDate,
      deadline:    r.deadline
    })));
  } catch (err) {
    console.error('❌ Error during testAddRfq:', err);
  } finally {
    process.exit(0);
  }
}

main();
