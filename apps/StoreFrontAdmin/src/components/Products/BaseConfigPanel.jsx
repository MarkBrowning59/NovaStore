// src/components/Products/BaseConfigPanel.jsx

import { useMemo, useState } from "react";
import { getByPath, setByPath } from "../../utils/inheritance";
import JsonOverrideEditor from "./JsonOverrideEditor";

export default function BaseConfigPanel({ defaults, setDefaults }) {
  const [tab, setTab] = useState("pricing");

  const tabs = useMemo(
    () => [
      { id: "pricing", label: "Pricing" },
      { id: "inventory", label: "Inventory" },
      { id: "variants", label: "Variants" },
      { id: "advanced", label: "Advanced JSON" }
    ],
    []
  );

  function set(path, val) {
    setDefaults((prev) => setByPath(prev, path, val));
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Base Config (Defaults)</div>
          <div className="mt-0.5 text-xs opacity-70">
            Parameter defaults inherited by derived products.
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
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold">
                Currency <span className="ml-2 text-[11px] opacity-50 font-mono">Defaults.config.pricing.currency</span>
              </div>
              <div className="mt-3">
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  value={getByPath(defaults, "config.pricing.currency", "USD")}
                  onChange={(e) => set("config.pricing.currency", e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold">
                Base Price <span className="ml-2 text-[11px] opacity-50 font-mono">Defaults.config.pricing.basePrice</span>
              </div>
              <div className="mt-3">
                <input
                  type="number"
                  step="0.01"
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  value={getByPath(defaults, "config.pricing.basePrice", 0)}
                  onChange={(e) => set("config.pricing.basePrice", Number(e.target.value || 0))}
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold">
                  Quote Instructions <span className="ml-2 text-[11px] opacity-50 font-mono">Defaults.config.pricing.quoteInstructions</span>
                </div>
                <div className="mt-3">
                  <textarea
                    rows={4}
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                    value={getByPath(defaults, "config.pricing.quoteInstructions", "")}
                    onChange={(e) => set("config.pricing.quoteInstructions", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <JsonOverrideEditor
                label="Pricing Tiers (JSON)"
                path="config.pricing.tiers"
                baseDefaults={null}
                overrides={{}}
                resolved={defaults || {}}
                hint='Array of tiers, e.g. [{ "minQty": 10, "price": 1.25 }].'
                onOverride={() => {}}
                onRevert={() => {}}
                onChangeObject={(obj) => set("config.pricing.tiers", obj)}
              />
            </div>
          </div>
        ) : null}

        {tab === "inventory" ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold">
                BC Item No <span className="ml-2 text-[11px] opacity-50 font-mono">Defaults.config.inventory.bcItemNo</span>
              </div>
              <div className="mt-3">
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  value={getByPath(defaults, "config.inventory.bcItemNo", "") ?? ""}
                  onChange={(e) => set("config.inventory.bcItemNo", e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold">
                Reorder Point <span className="ml-2 text-[11px] opacity-50 font-mono">Defaults.config.inventory.reorderPoint</span>
              </div>
              <div className="mt-3">
                <input
                  type="number"
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  value={getByPath(defaults, "config.inventory.reorderPoint", "") ?? ""}
                  onChange={(e) => set("config.inventory.reorderPoint", Number(e.target.value || 0))}
                />
              </div>
            </div>
          </div>
        ) : null}

        {tab === "variants" ? (
          <div className="grid grid-cols-1 gap-4">
            <JsonOverrideEditor
              label="Variant Options (JSON)"
              path="config.variants.options"
              baseDefaults={null}
              overrides={{}}
              resolved={defaults || {}}
              hint='Array of options, e.g. [{ "name":"Size","values":["S","M","L"] }].'
              onOverride={() => {}}
              onRevert={() => {}}
              onChangeObject={(obj) => set("config.variants.options", obj)}
            />
          </div>
        ) : null}

        {tab === "advanced" ? (
          <div className="grid grid-cols-1 gap-4">
            <JsonOverrideEditor
              label="Media (JSON)"
              path="config.media"
              baseDefaults={null}
              overrides={{}}
              resolved={defaults || {}}
              onOverride={() => {}}
              onRevert={() => {}}
              onChangeObject={(obj) => set("config.media", obj)}
            />

            <JsonOverrideEditor
              label="Fulfillment (JSON)"
              path="config.fulfillment"
              baseDefaults={null}
              overrides={{}}
              resolved={defaults || {}}
              onOverride={() => {}}
              onRevert={() => {}}
              onChangeObject={(obj) => set("config.fulfillment", obj)}
            />

            <JsonOverrideEditor
              label="Digital (JSON)"
              path="config.digital"
              baseDefaults={null}
              overrides={{}}
              resolved={defaults || {}}
              onOverride={() => {}}
              onRevert={() => {}}
              onChangeObject={(obj) => set("config.digital", obj)}
            />

            <JsonOverrideEditor
              label="Personalization (JSON)"
              path="config.personalization"
              baseDefaults={null}
              overrides={{}}
              resolved={defaults || {}}
              onOverride={() => {}}
              onRevert={() => {}}
              onChangeObject={(obj) => set("config.personalization", obj)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
