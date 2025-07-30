
import React, { useState, useEffect } from 'react';

interface SaveLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, owner: string) => void;
}

const SaveLayoutModal: React.FC<SaveLayoutModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setName('');
      setOwner('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (name.trim() && owner.trim()) {
      onSave(name.trim(), owner.trim());
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-white">Save Layout Details</h2>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="space-y-6">
            <div>
              <label htmlFor="layout-name" className="block text-sm font-medium text-gray-300 mb-2">
                Layout Name
              </label>
              <input
                type="text"
                id="layout-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Main Living Area"
                className="w-full bg-gray-700 border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="layout-owner" className="block text-sm font-medium text-gray-300 mb-2">
                Layout Owner
              </label>
              <input
                type="text"
                id="layout-owner"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="e.g., Jane Doe"
                className="w-full bg-gray-700 border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !owner.trim()}
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveLayoutModal;
