import { useEffect, useMemo, useState } from 'react';

const STATUS_OPTIONS = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
  { value: '3', label: 'Archived' },
];

export default function CatalogFormModal({
  open,
  mode = 'create', // 'create' | 'edit'
  initialCatalog,
  defaultParentId = null,
  onClose,
  onSubmit,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [statusId, setStatusId] = useState('1');
  const [productGroupType, setProductGroupType] = useState(1);
  const [imageName, setImageName] = useState('');

  const title = mode === 'edit' ? 'Edit Catalog' : 'Add Catalog';

  useEffect(() => {
    if (!open) return;

    const c = initialCatalog || {};
    setName(c?.name || '');
    setDescription(c?.description || '');
    setDisplayOrder(Number(c?.DisplayOrder ?? 1));
    setStatusId(String(c?.StatusID ?? c?.statusID ?? 1));
    setProductGroupType(Number(c?.ProductGroupType ?? 1));
    setImageName(c?.ImageName || '');
  }, [open, initialCatalog]);

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload = {
      name: name.trim(),
      description: description ?? '',
      DisplayOrder: Number.isFinite(+displayOrder) ? +displayOrder : 1,
      StatusID: Number(statusId),
      ProductGroupType: Number.isFinite(+productGroupType) ? +productGroupType : 1,
      ImageName: imageName ?? '',
      // parentId is enforced by CatalogsPageBase on CREATE (context-driven)
    };

    await onSubmit?.(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">{title}</div>
            {mode === 'edit' && initialCatalog?._id && (
              <div className="text-[11px] text-gray-500">ID: {String(initialCatalog._id)}</div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-2 py-1 rounded hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="px-5 py-4 space-y-3">
          {mode === 'create' && (
            <div className="text-[11px] text-gray-600 bg-gray-50 border rounded-lg px-3 py-2">
              {defaultParentId
                ? 'This catalog will be created under the currently selected catalog.'
                : 'This catalog will be created at the root level.'}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            <label className="space-y-1">
              <div className="text-xs font-medium text-gray-700">Name</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Catalog name"
                autoFocus
              />
            </label>

            <label className="space-y-1">
              <div className="text-xs font-medium text-gray-700">Description</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[80px]"
                placeholder="Optional description"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <div className="text-xs font-medium text-gray-700">Display Order</div>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </label>

              <label className="space-y-1">
                <div className="text-xs font-medium text-gray-700">Status</div>
                <select
                  value={statusId}
                  onChange={(e) => setStatusId(e.target.value)}
                  className="w-full text-sm px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <div className="text-xs font-medium text-gray-700">Product Group Type</div>
                <input
                  type="number"
                  value={productGroupType}
                  onChange={(e) => setProductGroupType(e.target.value)}
                  className="w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </label>

              <label className="space-y-1">
                <div className="text-xs font-medium text-gray-700">Image Name</div>
                <input
                  value={imageName}
                  onChange={(e) => setImageName(e.target.value)}
                  className="w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. abc123.png"
                />
              </label>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="text-sm px-3 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700"
            >
              {mode === 'edit' ? 'Save changes' : 'Create catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
