// src/components/Products/ProductProfileFormModal.jsx
import { useEffect, useState } from 'react';

export default function ProductProfileFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}) {
  const isEdit = !!initialData;

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [storeNumber, setStoreNumber] = useState('');
  const [systems, setSystems] = useState('');
  const [propertiesText, setPropertiesText] = useState('{\n  \n}');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setId(initialData._id || '');
      setName(initialData.Name || '');
      setDescription(initialData.Description || '');
      setCustomerId(initialData.Scope?.CustomerID || '');
      setStoreNumber(initialData.Scope?.StoreNumber || '');
      setSystems((initialData.Scope?.Systems || []).join(', '));
      setPropertiesText(
        JSON.stringify(initialData.Properties || {}, null, 2)
      );
      setError('');
    } else {
      setId('');
      setName('');
      setDescription('');
      setCustomerId('');
      setStoreNumber('');
      setSystems('');
      setPropertiesText('{\n  \n}');
      setError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    let parsedProperties = {};
    try {
      const trimmed = propertiesText.trim();
      parsedProperties = trimmed ? JSON.parse(trimmed) : {};
    } catch (err) {
      setError('Properties must be valid JSON.');
      return;
    }

    if (!id && !isEdit) {
      setError('Profile key (_id) is required.');
      return;
    }

    if (!name) {
      setError('Name is required.');
      return;
    }

    const payload = {
      _id: id,
      Name: name,
      Description: description,
      Scope: {
        CustomerID: customerId || null,
        StoreNumber: storeNumber || null,
        Systems: systems
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      },
      Properties: parsedProperties,
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {isEdit ? 'Edit Product Profile' : 'Add Product Profile'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-3 text-sm text-red-600 border border-red-300 rounded p-2 bg-red-50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Profile Key (_id)
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                disabled={isEdit}
                className="w-full border rounded px-2 py-1 text-sm disabled:bg-gray-100"
                placeholder="StandardApparelProfile"
              />
              {!isEdit && (
                <p className="text-xs text-gray-500 mt-1">
                  Used as the unique key. Cannot be changed after creation.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="Standard Apparel Defaults"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Customer ID (optional)
              </label>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Store Number (optional)
              </label>
              <input
                type="text"
                value={storeNumber}
                onChange={(e) => setStoreNumber(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Systems (comma separated)
              </label>
              <input
                type="text"
                value={systems}
                onChange={(e) => setSystems(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="NovaStore, XMPie, BC"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm min-h-[60px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Properties (JSON)
            </label>
            <textarea
              value={propertiesText}
              onChange={(e) => setPropertiesText(e.target.value)}
              className="w-full border rounded px-2 py-1 font-mono text-xs min-h-[200px]"
              placeholder={`{
  "Inventory": {
    "TrackInventory": true
  },
  "Production": {
    "DefaultTurnAroundDays": 3
  }
}`}
            />
            <p className="text-xs text-gray-500 mt-1">
              v1: edit as raw JSON. We can later replace this with a structured form
              (Inventory, Shipping, Production, etc.).
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-sm border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {isEdit ? 'Save Changes' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
