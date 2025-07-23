// src/components/RejectionModal.js
import React, { useState } from 'react';

export default function RejectionModal({ onCancel, onSubmit }) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Reject RFQ</h2>
        <textarea
          className="w-full border border-gray-300 rounded p-2 mb-4 resize-none h-24"
          placeholder="Enter rejection reason"
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(reason)}
            disabled={!reason.trim()}
            className={`px-4 py-2 rounded text-white ${
              reason.trim() ? 'bg-red-500 hover:bg-red-600' : 'bg-red-300 cursor-not-allowed'
            }`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
