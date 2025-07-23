// src/utils/access.js

/**
 * Simple RBAC permission matrix
 */
export const permissions = {
  'user:manage':    ['Admin'],
  'rfq:create':     ['Admin', 'Manager'],
  'rfq:edit':       ['Admin', 'Manager'],
  'rfq:delete':     ['Admin'],
  'rfq:view':       ['Admin', 'Manager', 'Viewer']
};

/**
 * Returns true if the given role may perform the given action.
 * @param {string} role
 * @param {string} action
 */
export function hasAccess(role, action) {
  const allowed = permissions[action] || [];
  return allowed.includes(role);
}
