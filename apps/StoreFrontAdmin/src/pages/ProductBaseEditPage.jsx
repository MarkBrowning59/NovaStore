import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductBase, updateProductBase } from "../services/productBasesApi";
import BaseCapabilitiesPanel from "../components/Products/BaseCapabilitiesPanel";
import BaseConfigPanel from "../components/Products/BaseConfigPanel";

export default function ProductBaseEditPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [base, setBase] = useState(null);
  const [name, setName] = useState("");
  const [defaults, setDefaults] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await getProductBase(id);
        if (cancelled) return;

        setBase(data);
        setName(data?.Name || "");
        setDefaults(data?.Defaults || {});
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load base product.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const title = useMemo(() => name || base?._id || "Base Product", [name, base]);

  async function onSave() {
    if (!base?._id) return;

    try {
      setSaving(true);
      setError("");

      const patch = { Name: name, Defaults: defaults };

      const res = await updateProductBase(base._id, patch);
      const updated = res?.baseProduct || res;

      setBase(updated);
      setName(updated?.Name || name);
      setDefaults(updated?.Defaults || defaults);
    } catch (e) {
      setError(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-4 text-sm">Loading base product…</div>;
  if (error) return <div className="p-4 text-sm text-red-600">Error: {error}</div>;
  if (!base) return <div className="p-4 text-sm">Base product not found.</div>;

  return (
    <div className="p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xl font-semibold truncate">{title}</div>
          <div className="mt-1 text-xs opacity-70">
            Base ID: <span className="font-mono">{base._id}</span>
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
  className="rounded-xl border px-4 py-2 text-sm shadow-sm hover:bg-slate-50"
  onClick={() => nav("/productBases/new")}
>
  New Base
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

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">General</div>

        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <div className="text-xs opacity-70 mb-1">Base ID (read-only)</div>
            <input className="w-full rounded-xl border px-3 py-2 text-sm bg-slate-50" value={base._id} disabled />
          </div>

          <div>
            <div className="text-xs opacity-70 mb-1">Name</div>
            <input
              className="w-full rounded-xl border px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
