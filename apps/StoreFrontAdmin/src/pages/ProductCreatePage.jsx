import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createProduct } from "../services/productApi";
import { listProductBases } from "../services/productBasesApi";
import { addProductToCatalog } from "../services/catalogApi";


export default function ProductCreatePage() {
  const nav = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const catalogId = location.state?.catalogId || params.get('catalogId');

  const [name, setName] = useState("");
  const [baseId, setBaseId] = useState("");
  const [bases, setBases] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [createdId, setCreatedId] = useState(null);
  useEffect(() => {
    listProductBases().then((res) => {
      setBases(res?.items || res || []);
    });
  }, []);
async function onCreate() {
  if (!name) {
    setError("Product name is required.");
    return;
  }
  if (!catalogId) {
    setError("Missing catalog context.");
    return;
  }

  try {
    setSaving(true);
    setError("");

    const payload = {
      CatalogIds: [catalogId],
      ProductDefinition: { Name: name },
      BaseProductID: baseId || null,
      Overrides: {},
      Extensions: {},
    };

    const res = await createProduct(payload);
    const created = res?.product || res;

    if (!created?._id) {
      throw new Error("Product created but no _id returned.");
    }

await addProductToCatalog(catalogId, created._id);

// optional success banner
setCreatedId(created._id);

    nav(`/products/${encodeURIComponent(created._id)}`, {
      state: { catalogId },
    });
  } catch (e) {
    setError(e?.response?.data?.message || e.message);
  } finally {
    setSaving(false);
  }
}


  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-lg font-semibold">Create Product</h1>

      
<div className="mb-4 rounded-xl border bg-slate-50 p-3 text-sm">
  <div className="font-medium">Current Catalog</div>
  
{createdId && (
  <div className="mb-4 rounded-xl border border-green-300 bg-green-50 p-3 text-sm">
    <div className="font-medium text-green-800">✅ Product created successfully</div>
    <div className="mt-1 font-mono text-xs text-green-900">ID: {createdId}</div>
  </div>
)}

{catalogId ? (
    <div className="mt-1">
      <span className="rounded-lg bg-white px-2 py-1 font-mono text-xs shadow-sm">
        {catalogId}
      </span>
    </div>
  ) : (
    <div className="mt-1 text-red-600">
      Missing catalog context. Go back to a catalog and click <span className="font-semibold">+ New Product</span>.
    </div>
  )}
</div>
{error && <div className="mb-3 text-sm text-red-600">{error}</div>}



      <div className="mb-3">
        <label className="block text-sm font-medium">Name</label>
        <input
          className="mt-1 w-full rounded-lg border px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium">Base Product</label>
        <select
          className="mt-1 w-full rounded-lg border px-3 py-2"
          value={baseId}
          onChange={(e) => setBaseId(e.target.value)}
        >
          <option value="">(No base)</option>
          {bases.map((b) => (
            <option key={b._id} value={b._id}>
              {b.Name} ({b._id})
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          className="rounded-xl border px-4 py-2"
          onClick={() => nav(-1)}
        >
          Cancel
        </button>
        <button
          disabled={saving}
          className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          onClick={onCreate}
        >
          Create
        </button>
      </div>
    </div>
  );
}
