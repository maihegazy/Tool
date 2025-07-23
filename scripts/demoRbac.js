// scripts/demoRbac.js

import { hasAccess } from '../src/utils/access';

const users = [
  { name: 'Alice', role: 'Admin' },
  { name: 'Bob',   role: 'Manager' },
  { name: 'Cathy', role: 'Viewer' }
];

const actions = [
  'user:manage',
  'rfq:create',
  'rfq:edit',
  'rfq:delete',
  'rfq:view'
];

users.forEach(u => {
  console.log(`\n=== ${u.name} (${u.role}) ===`);
  actions.forEach(a => {
    console.log(`${a}: ${hasAccess(u.role, a) ? '✅' : '❌'}`);
  });
});
