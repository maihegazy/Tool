'use client';
import React from 'react';

const RateSettingsModal = ({ engineerRates, setEngineerRates, onClose }) => {
  const engineerLevels = Object.keys(engineerRates);
  const locations = ['HCC', 'BCC', 'MCC'];

  const updateRate = (level, location, newRate) => {
    setEngineerRates(prev => ({
      ...prev,
      [level]: {
        ...prev[level],
        [location]: parseFloat(newRate) || 0
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-4/5 max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Hourly Rate Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left">Engineer Level</th>
                <th className="border border-gray-200 px-4 py-2 text-left">HCC (€/h)</th>
                <th className="border border-gray-200 px-4 py-2 text-left">BCC (€/h)</th>
                <th className="border border-gray-200 px-4 py-2 text-left">MCC (€/h)</th>
              </tr>
            </thead>
            <tbody>
              {engineerLevels.map(level => (
                <tr key={level}>
                  <td className="border border-gray-200 px-4 py-2 font-medium">{level}</td>
                  {locations.map(location => (
                    <td key={location} className="border border-gray-200 px-4 py-2">
                      <input
                        type="number"
                        value={engineerRates[level][location]}
                        onChange={(e) => updateRate(level, location, e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                        min="0"
                        step="0.01"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default RateSettingsModal;