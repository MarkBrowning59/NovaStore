// src/pages/ProductEditPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getProduct, updateProduct, cloneProduct } from "../services/productApi";

import InheritedField from "../components/Products/InheritedField";
import JsonOverrideEditor from "../components/Products/JsonOverrideEditor";
import { deepMerge, getByPath, setByPath, deleteByPath } from "../utils/inheritance";
import { listProductBases, createProductBase, getProductBase } from "../services/productBasesApi";

/**
 * Inheritance-aware Product Edit:
 * - Supports selecting/changing BaseProductID
 * - Edits write to Overrides (and Extensions later)
 * - Shows Inherited vs Overridden per-field
 */
export default function ProductEditPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [product, setProduct] = useState(null);

  const [baseDoc, setBaseDoc] = useState(null);

  const currentCatalogId = useMemo(() => {
    // Prefer catalogId passed via navigation state from ProductGrid
    const fromState = location?.state?.catalogId;
    if (fromState) return fromState;

    // Fallback: use first CatalogIds entry if present
    const arr = Array.isArray(product?.CatalogIds) ? product.CatalogIds : [];
    return arr.length ? arr[0] : null;
  }, [location, product]);

  const [overrides, setOverrides] = useState({});
  const [extensions, setExtensions] = useState({});

  const [baseOptions, setBaseOptions] = useState([]);
  const [baseLoading, setBaseLoading] = useState(false);
  const [baseProductId, setBaseProductId] = useState(null);

  // Load product

useEffect(() => {
  let cancelled = false;

  async function loadBase() {
    try {
      // If API already embedded it, use it
      const embedded = product?.BaseProduct;
      if (embedded) {
        setBaseDoc(embedded);
        return;
      }

      if (!baseProductId) {
        setBaseDoc(null);
        return;
      }

      const res = await getProductBase(baseProductId);
      if (cancelled) return;

      setBaseDoc(res?.baseProduct || res);
    } catch (e) {
      console.warn("Failed to load base product:", e);
      setBaseDoc(null);
    }
  }

  loadBase();
  return () => {
    cancelled = true;
  };
}, [baseProductId, product]);


  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await getProduct(id);
        if (cancelled) return;

        setProduct(data);
        setOverrides(data?.Overrides || {});
        setExtensions(data?.Extensions || {});
        setBaseProductId(data?.BaseProductID ?? null);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load product.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Load base options for selector
  useEffect(() => {
    let cancelled = false;

    async function loadBases() {
      try {
        setBaseLoading(true);
        const data = await listProductBases({ page: 1, pageSize: 500 });
        if (cancelled) return;

        const items = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
            ? data
            : [];

        setBaseOptions(items);
      } catch (e) {
        // Non-fatal (editing still works)
        console.warn("Could not load product bases:", e);
      } finally {
        if (!cancelled) setBaseLoading(false);
      }
    }

    loadBases();
    return () => {
      cancelled = true;
    };
  }, []);

  // Base defaults come from embedded BaseProduct (if backend includes it).
const baseDefaults = useMemo(() => baseDoc?.Defaults || null, [baseDoc]);


  // Local resolved view updates instantly as overrides change.
  const resolved = useMemo(() => {
    const base = baseDefaults || {};
    let merged = deepMerge(base, overrides, extensions);

    // Back-compat: preserve legacy fields stored directly on product docs.
    const legacyDef = product?.ProductDefinition;
    if (legacyDef && typeof legacyDef === "object") {
      merged.ProductDefinition = deepMerge(merged.ProductDefinition || {}, legacyDef);
    }

    if (product?.capabilities && typeof product.capabilities === "object") {
      merged.capabilities = deepMerge(merged.capabilities || {}, product.capabilities);
    }
    if (product?.config && typeof product.config === "object") {
      merged.config = deepMerge(merged.config || {}, product.config);
    }
    if (product?.productType) merged.productType = merged.productType ?? product.productType;
    if (product?.interactionType) merged.interactionType = merged.interactionType ?? product.interactionType;

    return merged;
  }, [baseDefaults, overrides, extensions, product]);

  const title = useMemo(() => {
    const n = getByPath(resolved, "ProductDefinition.Name", "");
    return n || product?._id || "Product";
  }, [resolved, product]);

async function onClone() {
  if (!product?._id) return;

  // Default: clone into the current catalog context (required by schema)
  const defaultNewId = `${product._id}_COPY_${Date.now()}`;
  const newId = window.prompt("New Product ID (string _id):", defaultNewId);
  if (!newId) return;

  const defaultName = `${getByPath(resolved, "ProductDefinition.Name", product._id)} (Copy)`;
  const newName = window.prompt("New Product Name:", defaultName) || defaultName;

  try {
    setSaving(true);
    setError("");

    const body = {
      newId,
      newName,
      // IMPORTANT: Product schema requires CatalogIds non-empty.
      // Default to current catalogId (from ProductGrid state or product.CatalogIds[0])
      catalogId: currentCatalogId,
      keepCatalogIds: true,
    };

    const res = await cloneProduct(product._id, body);
    const cloned = res?.product || res;

    // Navigate to the new product edit page
    if (cloned?._id) {
      nav(`/products/${encodeURIComponent(cloned._id)}`, {
        state: { catalogId: currentCatalogId },
      });
    }
  } catch (e) {
    setError(e?.response?.data?.message || e?.message || "Clone failed.");
  } finally {
    setSaving(false);
  }
}

async function onCreateBaseFromProduct() {
  if (!product?._id) return;

  // Snapshot the current resolved product (base defaults + overrides) into a new BaseProduct.Defaults
  const defaultBaseId = `PB_${product._id}_BASE_${Date.now()}`;
  const baseId = window.prompt("New Base Product ID (string _id):", defaultBaseId);
  if (!baseId) return;

  const resolvedName = getByPath(resolved, "ProductDefinition.Name", product._id);
  const defaultBaseName = `${resolvedName} (Base)`;
  const baseName = window.prompt("Base Product Name:", defaultBaseName) || defaultBaseName;

  const defaults = {
    ProductDefinition: getByPath(resolved, "ProductDefinition", {}),
    capabilities: getByPath(resolved, "capabilities", {}),
    config: getByPath(resolved, "config", {}),
  };

  try {
    setSaving(true);
    setError("");

    const payload = {
      _id: String(baseId).trim(),
      Name: String(baseName).trim(),
      Defaults: defaults,
    };

    const res = await createProductBase(payload);
    const created = res?.baseProduct || res;

    if (created?._id) {
      nav(`/productBases/${encodeURIComponent(created._id)}`);
    }
  } catch (e) {
    setError(e?.response?.data?.message || e?.message || "Create base from product failed.");
  } finally {
    setSaving(false);
  }
}

  async function onSave() {
    if (!product?._id) return;

    try {
      setSaving(true);
      setError("");

      const patch = {
        BaseProductID: baseProductId ?? null,
        Overrides: overrides,
        Extensions: extensions,
      };

      const updated = await updateProduct(product._id, patch);

      // PATCH may return { message, product } or the document directly
      const newDoc = updated?.product || updated;

      setProduct(newDoc);
      setOverrides(newDoc?.Overrides || overrides);
      setExtensions(newDoc?.Extensions || extensions);
      setBaseProductId(newDoc?.BaseProductID ?? baseProductId);
    } catch (e) {
      setError(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function overrideField(path) {
    const current = getByPath(resolved, path, "");
    setOverrides((prev) => setByPath(prev, path, current));
  }

  function revertField(path) {
    setOverrides((prev) => deleteByPath(prev, path));
  }

  function changeField(path, newValue) {
    setOverrides((prev) => setByPath(prev, path, newValue));
  }

  function onBaseChange(newBaseId) {
    const next = newBaseId || null;
    const hasOverrides = overrides && Object.keys(overrides).length > 0;

    if (hasOverrides && next !== baseProductId) {
      const clear = window.confirm(
        "You have overrides on this product.\n\nClick OK to CLEAR overrides (start fresh from the new base).\nClick Cancel to KEEP overrides (they will apply on top of the new base)."
      );
      if (clear) setOverrides({});
    }

    setBaseProductId(next);
  }

  if (loading) return <div className="p-4 text-sm">Loading product…</div>;
  if (error) return <div className="p-4 text-sm text-red-600">Error: {error}</div>;
  if (!product) return <div className="p-4 text-sm">Product not found.</div>;

  return (
    <div className="p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xl font-semibold truncate">{title}</div>
          <div className="mt-1 text-xs opacity-70">
            Product ID: <span className="font-mono">{product._id}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-xl border px-4 py-2 text-sm shadow-sm hover:bg-slate-50"
            onClick={() => nav(-1)}
          >
            Back
          </button>

          <button
            type="button"
            className="rounded-xl border px-4 py-2 text-sm shadow-sm hover:bg-slate-50 disabled:opacity-60"
            onClick={onClone}
            disabled={saving}
            title={currentCatalogId ? `Clone into catalog ${currentCatalogId}` : "Clone (requires a catalog)"}
          >
            Clone
          </button>

          <button
            type="button"
            className="rounded-xl border px-4 py-2 text-sm shadow-sm hover:bg-slate-50 disabled:opacity-60"
            onClick={onCreateBaseFromProduct}
            disabled={saving}
            title="Create a BaseProduct from the current resolved product"
          >
            Create Base
          </button>

          <button
            type="button"
            className="rounded-xl border px-4 py-2 text-sm shadow-sm hover:bg-slate-50 disabled:opacity-60"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Base selector */}
      <div className="mb-4 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold">Base Product</div>
            <div className="mt-0.5 text-xs opacity-70">
              Select a base (template/class). Inherited fields come from base defaults.
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              className="w-full sm:w-[420px] rounded-xl border px-3 py-2 text-sm bg-white"
              value={baseProductId ?? ""}
              onChange={(e) => onBaseChange(e.target.value)}
              disabled={baseLoading}
            >
              <option value="">(No base)</option>
              {baseOptions.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.Name} ({b._id})
                </option>
              ))}
            </select>

            {/* Optional: link to base editor route (adjust route to your app) */}
            {baseProductId ? (
              <button
                type="button"
                className="rounded-xl border px-3 py-2 text-sm shadow-sm hover:bg-slate-50"
                onClick={() => nav(`/productBases/${encodeURIComponent(baseProductId)}`)}
                title="Open Base Product editor (route may need adjustment)"
              >
                Edit base
              </button>
            ) : null}
          </div>
        </div>

        {baseLoading ? (
          <div className="mt-2 text-xs opacity-70">Loading base list…</div>
        ) : null}
      </div>

      {/* (2) Inheritance fields: ProductDefinition */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InheritedField
          label="Name"
          path="ProductDefinition.Name"
          baseDefaults={baseDefaults}
          overrides={overrides}
          resolved={resolved}
          hint="Displayed in grids, search results, and product page header."
          onOverride={() => overrideField("ProductDefinition.Name")}
          onRevert={() => revertField("ProductDefinition.Name")}
          onChange={(v) => changeField("ProductDefinition.Name", v)}
          renderInput={({ value, disabled, onChange }) => (
            <input
              className="w-full rounded-xl border px-3 py-2 text-sm disabled:bg-slate-50"
              value={value}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
        />

        <InheritedField
          label="Short Description"
          path="ProductDefinition.ShortDescription"
          baseDefaults={baseDefaults}
          overrides={overrides}
          resolved={resolved}
          hint="Quick one-liner shown in cards and lists."
          onOverride={() => overrideField("ProductDefinition.ShortDescription")}
          onRevert={() => revertField("ProductDefinition.ShortDescription")}
          onChange={(v) => changeField("ProductDefinition.ShortDescription", v)}
          renderInput={({ value, disabled, onChange }) => (
            <textarea
              className="w-full rounded-xl border px-3 py-2 text-sm disabled:bg-slate-50"
              rows={3}
              value={value}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
        />

        <div className="lg:col-span-2">
          <JsonOverrideEditor
            label="Capabilities (JSON)"
            path="capabilities"
            baseDefaults={baseDefaults}
            overrides={overrides}
            resolved={resolved}
            hint="Advanced. Store as JSON. (We can replace this with toggles later.)"
            onOverride={() => overrideField("capabilities")}
            onRevert={() => revertField("capabilities")}
            onChangeObject={(obj) => changeField("capabilities", obj)}
          />
        </div>

        <div className="lg:col-span-2">
          <JsonOverrideEditor
            label="Config (JSON)"
            path="config"
            baseDefaults={baseDefaults}
            overrides={overrides}
            resolved={resolved}
            hint="Advanced. Store as JSON. (We can replace this with structured panels later.)"
            onOverride={() => overrideField("config")}
            onRevert={() => revertField("config")}
            onChangeObject={(obj) => changeField("config", obj)}
          />
        </div>
      </div>

      {/* (3) Small UI polish: show base + override counts */}
      <div className="mt-6 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <span className="font-semibold">Inheritance summary:</span>{" "}
            {baseProductId ? (
              <>
                Base <span className="font-mono">{baseProductId}</span>
              </>
            ) : (
              "No base attached"
            )}
          </div>

          <div className="text-xs opacity-70">
            Overrides: {Object.keys(overrides || {}).length} • Extensions:{" "}
            {Object.keys(extensions || {}).length}
          </div>
        </div>
      </div>
    </div>
  );
}
