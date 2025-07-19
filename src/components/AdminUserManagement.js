'use client';
import React, { useState } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';

const AdminUserManagement = ({ auth, utils }) => {
  const [users, setUsers] = useState(auth.userDatabase);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'Project Leader',
    name: '',
    department: '',
    isActive: true
  });

  const rolePermissions = {
    'Admin': ['all'],
    'Delivery Manager': ['all'],
    'Project Leader': ['edit_rfqs', 'view_allocations', 'manage_resources','view_reports'],
    'Resource Manager': ['view_allocations', 'manage_resources', 'view_reports']
  };

  const addUser = () => {
    if (newUser.email && newUser.password && newUser.name) {
      const user = {
        id: Math.max(...users.map(u => u.id)) + 1,
        ...newUser,
        permissions: rolePermissions[newUser.role],
        lastLogin: null
      };
      setUsers([...users, user]);
      setNewUser({
        email: '',
        password: '',
        role: 'Project Leader',
        name: '',
        department: '',
        isActive: true
      });
      setShowAddUser(false);
    }
  };

  const updateUser = (id, updates) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, ...updates, permissions: rolePermissions[updates.role || user.role] }
        : user
    ));
    setEditingUser(null);
  };

  const toggleUserStatus = (id) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, isActive: !user.isActive } : user
    ));
  };

  const deleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">User Management</h2>
        <button
          onClick={() => setShowAddUser(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
        >
          <Plus size={16} className="mr-1" />
          Add User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Email</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Role</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Department</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Last Login</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className={!user.isActive ? 'bg-gray-100' : ''}>
                <td className="border border-gray-200 px-4 py-2 font-medium">{user.name}</td>
                <td className="border border-gray-200 px-4 py-2">{user.email}</td>
                <td className="border border-gray-200 px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs text-white ${utils.getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="border border-gray-200 px-4 py-2">{user.department}</td>
                <td className="border border-gray-200 px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="border border-gray-200 px-4 py-2 text-sm">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={user.isActive ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'}
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {user.isActive ? '⏸' : '▶'}
                    </button>
                    {user.id !== auth.currentUser.id && (
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New User</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="Project Leader">Project Leader</option>
                <option value="Delivery Manager">Delivery Manager</option>
                <option value="Resource Manager">Resource Manager</option>
                <option value="Admin">Admin</option>
              </select>
              <input
                type="text"
                placeholder="Department"
                value={newUser.department}
                onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddUser(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={addUser}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={editingUser.name}
                onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="Project Leader">Project Leader</option>
                <option value="Delivery Manager">Delivery Manager</option>
                <option value="Resource Manager">Resource Manager</option>
                <option value="Admin">Admin</option>
              </select>
              <input
                type="text"
                value={editingUser.department}
                onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => updateUser(editingUser.id, editingUser)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;