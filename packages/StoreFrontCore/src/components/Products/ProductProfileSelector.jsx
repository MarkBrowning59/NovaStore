// src/components/Products/ProductProfileSelector.jsx

import { useEffect, useState } from 'react';
import { fetchProductProfiles } from '../../services/productProfilesApi';

/**
 * Props:
 *  - value: string[] (currently selected profile IDs)
 *  - onChange: (newIds: string[]) => void
 */
export default function ProductProfileSelector({ value, onChange }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedIds = Array.isArray(value) ? value : [];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchProductProfiles({ page: 1, pageSize: 100 });
        setProfiles(data.profiles || []);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load product profiles.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const toggleProfile = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">
          Product Profiles
        </label>
        {loading && (
          <span className="text-xs text-gray-500">Loading...</span>
        )}
      </div>

      {error && (
        <div className="text-xs text-red-600 border border-red-300 rounded p-2 bg-red-50">
          {error}
        </div>
      )}

      {profiles.length === 0 && !loading && !error && (
        <div className="text-xs text-gray-500">
          No profiles defined yet. Create some in the Product Profiles admin page.
        </div>
      )}

      <div className="space-y-1 max-h-48 overflow-auto border rounded p-2 bg-gray-50">
        {profiles.map((profile) => {
          const checked = selectedIds.includes(profile._id);
          return (
            <label
              key={profile._id}
              className="flex items-start gap-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                className="mt-0.5"
                checked={checked}
                onChange={() => toggleProfile(profile._id)}
              />
              <div>
                <div className="font-medium">
                  {profile.Name || profile._id}
                </div>
                <div className="text-xs text-gray-600">
                  Key: <span className="font-mono">{profile._id}</span>
                </div>
                {profile.Description && (
                  <div className="text-xs text-gray-500">
                    {profile.Description}
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {selectedIds.length > 0 && (
        <div className="text-xs text-gray-600">
          Selected: {selectedIds.join(', ')}
        </div>
      )}
    </div>
  );
}
