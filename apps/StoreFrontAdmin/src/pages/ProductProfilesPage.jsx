// src/pages/ProductProfilesPage.jsx
import { useEffect, useState } from 'react';
import {
  fetchProductProfiles,
  createProductProfile,
  updateProductProfile,
  deleteProductProfile,
} from '../services/productProfilesApi';
import ProductProfileFormModal from '../components/Products/ProductProfileFormModal';

export default function ProductProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const loadProfiles = async (pageToLoad = 1) => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchProductProfiles({
        page: pageToLoad,
        pageSize,
      });
      setProfiles(data.profiles || []);
      setTotal(data.total || 0);
      setPage(data.page || pageToLoad);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load product profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddClick = () => {
    setEditingProfile(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (profile) => {
    setEditingProfile(profile);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (profile) => {
    const ok = window.confirm(
      `Delete product profile "${profile.Name}" (${profile._id})?`
    );
    if (!ok) return;

    try {
      setLoading(true);
      setError('');
      await deleteProductProfile(profile._id);
      await loadProfiles(page);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to delete profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalSave = async (payload) => {
    try {
      setLoading(true);
      setError('');
      if (editingProfile) {
        await updateProductProfile(editingProfile._id, {
          // ignore _id in payload; key is path param
          Name: payload.Name,
          Description: payload.Description,
          Scope: payload.Scope,
          Properties: payload.Properties,
        });
      } else {
        await createProductProfile(payload);
      }

      setIsModalOpen(false);
      setEditingProfile(null);
      await loadProfiles(1);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProfile(null);
  };

  const handlePrevPage = () => {
    if (page <= 1) return;
    loadProfiles(page - 1);
  };

  const handleNextPage = () => {
    if (page >= totalPages) return;
    loadProfiles(page + 1);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-semibold">Product Profiles</h1>
          <p className="text-sm text-gray-600">
            Reusable property sets shared across multiple products.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddClick}
          className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          + Add Profile
        </button>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-600 border border-red-300 rounded p-2 bg-red-50">
          {error}
        </div>
      )}

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-3 py-2 border-b">Key (_id)</th>
              <th className="text-left px-3 py-2 border-b">Name</th>
              <th className="text-left px-3 py-2 border-b">Scope</th>
              <th className="text-left px-3 py-2 border-b">Systems</th>
              <th className="text-left px-3 py-2 border-b">Updated</th>
              <th className="text-right px-3 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-4 text-center text-gray-500"
                >
                  No product profiles found.
                </td>
              </tr>
            )}

            {profiles.map((profile) => (
              <tr key={profile._id} className="hover:bg-gray-50">
                <td className="px-3 py-2 border-b font-mono text-xs">
                  {profile._id}
                </td>
                <td className="px-3 py-2 border-b">{profile.Name}</td>
                <td className="px-3 py-2 border-b text-xs text-gray-700">
                  {profile.Scope?.CustomerID && (
                    <div>Customer: {profile.Scope.CustomerID}</div>
                  )}
                  {profile.Scope?.StoreNumber && (
                    <div>Store: {profile.Scope.StoreNumber}</div>
                  )}
                </td>
                <td className="px-3 py-2 border-b text-xs text-gray-700">
                  {(profile.Scope?.Systems || []).join(', ')}
                </td>
                <td className="px-3 py-2 border-b text-xs text-gray-500">
                  {profile.UpdatedAt
                    ? new Date(profile.UpdatedAt).toLocaleString()
                    : ''}
                </td>
                <td className="px-3 py-2 border-b text-right">
                  <button
                    type="button"
                    onClick={() => handleEditClick(profile)}
                    className="text-xs mr-2 px-2 py-1 border rounded hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(profile)}
                    className="text-xs px-2 py-1 border rounded text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-3 text-center text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
        <div>
          Page {page} of {totalPages} ({total} total profiles)
        </div>
        <div className="space-x-2">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={page <= 1}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={page >= totalPages}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <ProductProfileFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        initialData={editingProfile}
      />
    </div>
  );
}
