// src/pages/ProductBaseCreatePage.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProductBase } from "../services/productBasesApi";
import BaseCapabilitiesPanel from "../components/Products/BaseCapabilitiesPanel";
import BaseConfigPanel from "../components/Products/BaseConfigPanel";
import { PRODUCT_BASE_PRESETS } from "../data/productBasePresets";

export default function ProductBaseCreatePage() {
  const nav = useNavigate();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [baseId, setBaseId] = useState("");
  const [name, setName] = useState("");
  const [presetId, setPresetId] = useState("blank");
  const [defaults, setDefaults] = useState(PRODUCT_BASE_PRESETS[0].build());

  const selectedPreset = useMemo(
    () => PRODUCT_BASE_PRESETS.find((p) => p.id === presetId) || PRODUCT_BASE_PRESETS[0],
    [presetId]
  );

  function applyPreset(id) {
    const preset = PRODUCT_BASE_PRESETS.find((p) => p.id === id) || PRODUCT_BASE_PRESETS[0];
    setPresetId(preset.id);

    const d = preset.build();
    setDefaults(d);

    const pdName = d?.ProductDefinition?.Name || "";
    if (!name && pdName) setName(pdName);
  }

  async function onCreate() {
    try {
      setSaving(true);
      setError("");

      if (!baseId.trim()) {
        setError("Base ID is required (e.g., PB_Apparel).");
        return;
      }
      if (!name.trim()) {
        setError("Name is required.");
        return;
      }

      const payload = {
        _id: baseId.trim(),
        Name: name.trim(),
        Defaults: defaults
      };

      const res = await createProductBase(payload);
      const created = res?.baseProduct || res;

      nav(`/productBases/${encodeURIComponent(created?._id || baseId.trim())}`);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Create failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xl font-semibold truncate">Create Base Product</div>
          <div className="mt-1 text-xs opacity-70">
            Create a new ProductBase with Defaults that products can inherit.
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-xl border px-4 py-2 text-sm shadow-sm hover:bg-slate-50"
            onClick={() => nav(-1)}
          >
            Cancel
          </button>

          <button
            type="button"
            className="rounded-xl border px-4 py-2 text-sm shadow-sm hover:bg-slate-50 disabled:opacity-60"
            onClick={onCreate}
            disabled={saving}
          >
            {saving ? "Creating…" : "Create"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">General</div>

        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div>
            <div className="text-xs opacity-70 mb-1">Base ID</div>
            <input
              className="w-full rounded-xl border px-3 py-2 text-sm"
              value={baseId}
              placeholder="PB_Apparel"
              onChange={(e) => setBaseId(e.target.value)}
            />
            <div className="mt-1 text-[11px] opacity-60">
              Must be unique. We use string IDs like PB_Apparel.
            </div>
          </div>

          <div>
            <div className="text-xs opacity-70 mb-1">Name</div>
            <input
              className="w-full rounded-xl border px-3 py-2 text-sm"
              value={name}
              placeholder="Custom Apparel"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <div className="text-xs opacity-70 mb-1">Preset</div>
            <select
              className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
              value={presetId}
              onChange={(e) => applyPreset(e.target.value)}
            >
              {PRODUCT_BASE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <div className="mt-1 text-[11px] opacity-60">
              Starts Defaults from a template ({selectedPreset.label}).
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <BaseCapabilitiesPanel defaults={defaults} setDefaults={setDefaults} />
        <BaseConfigPanel defaults={defaults} setDefaults={setDefaults} />
      </div>
    </div>
  );
}
