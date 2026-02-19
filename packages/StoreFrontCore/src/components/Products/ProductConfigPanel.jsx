// src/components/Products/ProductConfigPanel.jsx
import { useMemo, useState } from "react";
import InheritedField from "./InheritedField";
import JsonOverrideEditor from "./JsonOverrideEditor";

export default function ProductConfigPanel({
  baseDefaults,
  overrides,
  resolved,
  onOverrideField,
  onRevertField,
  onChangeField,
}) {
  const [tab, setTab] = useState("pricing");

  const tabs = useMemo(
    () => [
      { id: "pricing", label: "Pricing" },
      { id: "inventory", label: "Inventory" },
      { id: "variants", label: "Variants" },
      { id: "advanced", label: "Advanced JSON" },
    ],
    []
  );

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Config</div>
          <div className="mt-0.5 text-xs opacity-70">
            Parameters used by capabilities.
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={
                "rounded-xl border px-3 py-1.5 text-xs shadow-sm " +
                (tab === t.id ? "bg-slate-100" : "hover:bg-slate-50")
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {tab === "pricing" ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <InheritedField
              label="Currency"
              path="config.pricing.currency"
              baseDefaults={baseDefaults}
              overrides={overrides}
              resolved={resolved}
              hint="ISO currency code."
              onOverride={() => onOverrideField("config.pricing.currency")}
              onRevert={() => onRevertField("config.pricing.currency")}
              onChange={(v) => onChangeField("config.pricing.currency", v)}
              renderInput={({ value, disabled, onChange }) => (
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm disabled:bg-slate-50"
                  value={value ?? "USD"}
                  disabled={disabled}
                  onChange={(e) => onChange(e.target.value)}
                />
              )}
            />

            <InheritedField
              label="Base Price"
              path="config.pricing.basePrice"
              baseDefaults={baseDefaults}
              overrides={overrides}
              resolved={resolved}
              hint="Simple pricing model uses this."
              onOverride={() => onOverrideField("config.pricing.basePrice")}
              onRevert={() => onRevertField("config.pricing.basePrice")}
              onChange={(v) => onChangeField("config.pricing.basePrice", Number(v || 0))}
              renderInput={({ value, disabled, onChange }) => (
                <input
                  type="number"
                  step="0.01"
                  className="w-full rounded-xl border px-3 py-2 text-sm disabled:bg-slate-50"
                  value={value ?? 0}
                  disabled={disabled}
                  onChange={(e) => onChange(e.target.value)}
                />
              )}
            />

            <div className="lg:col-span-2">
              <InheritedField
                label="Quote Instructions"
                path="config.pricing.quoteInstructions"
                baseDefaults={baseDefaults}
                overrides={overrides}
                resolved={resolved}
                hint="Shown when pricing model is Quote."
                onOverride={() => onOverrideField("config.pricing.quoteInstructions")}
                onRevert={() => onRevertField("config.pricing.quoteInstructions")}
                onChange={(v) => onChangeField("config.pricing.quoteInstructions", v)}
                renderInput={({ value, disabled, onChange }) => (
                  <textarea
                    rows={4}
                    className="w-full rounded-xl border px-3 py-2 text-sm disabled:bg-slate-50"
                    value={value ?? ""}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                  />
                )}
              />
            </div>

            <div className="lg:col-span-2">
              <JsonOverrideEditor
                label="Pricing Tiers (JSON)"
                path="config.pricing.tiers"
                baseDefaults={baseDefaults}
                overrides={overrides}
                resolved={resolved}
                hint='Array of tiers, e.g. [{ "minQty": 10, "price": 1.25 }].'
                onOverride={() => onOverrideField("config.pricing.tiers")}
                onRevert={() => onRevertField("config.pricing.tiers")}
                onChangeObject={(obj) => onChangeField("config.pricing.tiers", obj)}
              />
            </div>
          </div>
        ) : null}

        {tab === "inventory" ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <InheritedField
              label="BC Item No"
              path="config.inventory.bcItemNo"
              baseDefaults={baseDefaults}
              overrides={overrides}
              resolved={resolved}
              hint="Business Central item number for inventory lookup."
              onOverride={() => onOverrideField("config.inventory.bcItemNo")}
              onRevert={() => onRevertField("config.inventory.bcItemNo")}
              onChange={(v) => onChangeField("config.inventory.bcItemNo", v)}
              renderInput={({ value, disabled, onChange }) => (
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm disabled:bg-slate-50"
                  value={value ?? ""}
                  disabled={disabled}
                  onChange={(e) => onChange(e.target.value)}
                />
              )}
            />

            <InheritedField
              label="Reorder Point"
              path="config.inventory.reorderPoint"
              baseDefaults={baseDefaults}
              overrides={overrides}
              resolved={resolved}
              hint="Optional warning threshold."
              onOverride={() => onOverrideField("config.inventory.reorderPoint")}
              onRevert={() => onRevertField("config.inventory.reorderPoint")}
              onChange={(v) => onChangeField("config.inventory.reorderPoint", Number(v || 0))}
              renderInput={({ value, disabled, onChange }) => (
                <input
                  type="number"
                  className="w-full rounded-xl border px-3 py-2 text-sm disabled:bg-slate-50"
                  value={value ?? ""}
                  disabled={disabled}
                  onChange={(e) => onChange(e.target.value)}
                />
              )}
            />
          </div>
        ) : null}

        {tab === "variants" ? (
          <div className="grid grid-cols-1 gap-4">
            <JsonOverrideEditor
              label="Variant Options (JSON)"
              path="config.variants.options"
              baseDefaults={baseDefaults}
              overrides={overrides}
              resolved={resolved}
              hint='Array of options, e.g. [{ "name":"Size","values":["S","M","L"] }].'
              onOverride={() => onOverrideField("config.variants.options")}
              onRevert={() => onRevertField("config.variants.options")}
              onChangeObject={(obj) => onChangeField("config.variants.options", obj)}
            />
          </div>
        ) : null}

        {tab === "advanced" ? (
          <div className="grid grid-cols-1 gap-4">
            <JsonOverrideEditor
              label="Media (JSON)"
              path="config.media"
              baseDefaults={baseDefaults}
              overrides={overrides}
              resolved={resolved}
              hint="Primary image URL, imageUrls, mockup fields, etc."
              onOverride={() => onOverrideField("config.media")}
              onRevert={() => onRevertField("config.media")}
              onChangeObject={(obj) => onChangeField("config.media", obj)}
            />

            <JsonOverrideEditor
              label="Fulfillment (JSON)"
              path="config.fulfillment"
              baseDefaults={baseDefaults}
              overrides={overrides}
              resolved={resolved}
              hint="Lead time, templates, packing/boxing parameters."
              onOverride={() => onOverrideField("config.fulfillment")}
              onRevert={() => onRevertField("config.fulfillment")}
              onChangeObject={(obj) => onChangeField("config.fulfillment", obj)}
            />

            <JsonOverrideEditor
              label="Digital (JSON)"
              path="config.digital"
              baseDefaults={baseDefaults}
              overrides={overrides}
              resolved={resolved}
              hint="Download URL, license text, access rules."
              onOverride={() => onOverrideField("config.digital")}
              onRevert={() => onRevertField("config.digital")}
              onChangeObject={(obj) => onChangeField("config.digital", obj)}
            />

            <JsonOverrideEditor
              label="Personalization (JSON)"
              path="config.personalization"
              baseDefaults={baseDefaults}
              overrides={overrides}
              resolved={resolved}
              hint="Field definitions, upload rules, validation."
              onOverride={() => onOverrideField("config.personalization")}
              onRevert={() => onRevertField("config.personalization")}
              onChangeObject={(obj) => onChangeField("config.personalization", obj)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
