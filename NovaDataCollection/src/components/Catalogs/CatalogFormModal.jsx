
// CatalogFormModal.jsx
import { useState, useEffect } from 'react';
import { addCatalog, updateCatalog } from '../../services/catalogApi';

export default function CatalogFormModal({ isOpen, onClose, parentCatalogName, initialCatalog = null }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageName, setImageName] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [statusId, setStatusId] = useState(1);

  useEffect(() => {
    if (isOpen) {
      if (initialCatalog) {
        setName(initialCatalog.name || '');
        setDescription(initialCatalog.description || '');
        setImageName(initialCatalog.ImageName || '');
        setDisplayOrder(initialCatalog.DisplayOrder || 1);
        setStatusId(
          initialCatalog.StatusID !== undefined && initialCatalog.StatusID !== null
            ? initialCatalog.StatusID
            : 1
        );
      } else {
        setName('');
        setDescription('');
        setImageName('');
        setDisplayOrder(1);
        setStatusId(1);
      }
    }
  }, [isOpen, initialCatalog]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Name is required');

    const catalogData = {
      ...initialCatalog,
      name,
      description,
      ImageName: imageName,
      DisplayOrder: parseInt(displayOrder, 10),
      StatusID: statusId
    };

    // Normalize products before sending update
    if (catalogData.products && Array.isArray(catalogData.products)) {
      catalogData.products = catalogData.products.map(p => ({
        ProductID: p.ProductID || p._id,
        DisplayOrder: p.DisplayOrder || 1
      }));
    }

    try {
      if (initialCatalog && initialCatalog._id) {
        console.log('🛠 Updating catalog with ID:', initialCatalog._id);
        await updateCatalog(initialCatalog._id, catalogData);
      } else {
        console.log('📦 Creating new catalog:', catalogData);
        await addCatalog(catalogData);
      }
      onClose(); // Let parent re-fetch
    } catch (err) {
      console.error('❌ Failed to save catalog:', err);
      alert('Failed to save catalog.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">{initialCatalog ? 'Edit Catalog' : 'Add Catalog'}</h2>
        <p className="mb-4 text-sm text-gray-600">{parentCatalogName ? `Under: ${parentCatalogName}` : 'Root Catalog'}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image Name</label>
            <input type="text" value={imageName} onChange={(e) => setImageName(e.target.value)} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Display Order</label>
            <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} className="w-full border rounded p-2" min="1" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select value={statusId} onChange={(e) => setStatusId(parseInt(e.target.value, 10))} className="w-full border rounded p-2">
              <option value="1">Active</option>
              <option value="0">Inactive</option>
              <option value="3">Archived</option>
            </select>
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
