'use client';
import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';

const LoginScreen = ({ auth, utils }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">RFQ Resource Planning</h1>
          <p className="text-gray-600">Please sign in to continue</p>
        </div>

        <form onSubmit={auth.handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={auth.loginForm.email}
              onChange={(e) => auth.setLoginForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your email"
              disabled={auth.isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={auth.loginForm.password}
              onChange={(e) => auth.setLoginForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your password"
              disabled={auth.isLoading}
            />
          </div>

          {auth.loginError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertCircle className="text-red-500 mr-2" size={16} />
                <span className="text-red-700 text-sm">{auth.loginError}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={auth.isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {auth.isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Demo Accounts:</h3>
          <div className="space-y-3 text-xs">
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="font-medium text-red-800">Admin Access</div>
              <div className="text-red-600 mt-1">
                Email: admin@company.com<br />
                Password: admin123
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-medium text-green-800">Delivery Manager</div>
              <div className="text-green-600 mt-1">
                Email: sarah.connor@company.com<br />
                Password: delivery123
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="font-medium text-blue-800">Project Leader</div>
              <div className="text-blue-600 mt-1">
                Email: john.smith@company.com<br />
                Password: project123
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="font-medium text-purple-800">Resource Manager</div>
              <div className="text-purple-600 mt-1">
                Email: emma.wilson@company.com<br />
                Password: resource123
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Contact IT support if you need assistance with your account
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;