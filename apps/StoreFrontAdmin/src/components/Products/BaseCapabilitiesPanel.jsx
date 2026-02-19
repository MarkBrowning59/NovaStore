// src/components/Products/BaseCapabilitiesPanel.jsx

import BaseToggleField from "./BaseToggleField";
import BaseSelectField from "./BaseSelectField";
import { getByPath, setByPath } from "../../utils/inheritance";

export default function BaseCapabilitiesPanel({ defaults, setDefaults }) {
  function set(path, val) {
    setDefaults((prev) => setByPath(prev, path, val));
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold">Base Capabilities (Defaults)</div>
      <div className="mt-0.5 text-xs opacity-70">
        These become the inherited defaults for products using this base.
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BaseToggleField
          label="Purchasable"
          path="Defaults.capabilities.purchasable"
          value={getByPath(defaults, "capabilities.purchasable", false)}
          hint="If disabled, derived products can't be ordered unless overridden."
          onChange={(v) => set("capabilities.purchasable", v)}
        />

        <BaseToggleField
          label="Requires Approval"
          path="Defaults.capabilities.requiresApproval"
          value={getByPath(defaults, "capabilities.requiresApproval", false)}
          onChange={(v) => set("capabilities.requiresApproval", v)}
        />

        <BaseToggleField
          label="Allow Notes"
          path="Defaults.capabilities.allowNotes"
          value={getByPath(defaults, "capabilities.allowNotes", true)}
          onChange={(v) => set("capabilities.allowNotes", v)}
        />

        <BaseToggleField
          label="Has Images"
          path="Defaults.capabilities.hasImages"
          value={getByPath(defaults, "capabilities.hasImages", true)}
          onChange={(v) => set("capabilities.hasImages", v)}
        />

        <BaseToggleField
          label="Track Inventory"
          path="Defaults.capabilities.inventory.track"
          value={getByPath(defaults, "capabilities.inventory.track", false)}
          onChange={(v) => set("capabilities.inventory.track", v)}
        />

        <BaseSelectField
          label="Inventory Source"
          path="Defaults.capabilities.inventory.source"
          value={getByPath(defaults, "capabilities.inventory.source", "none")}
          options={[
            { label: "None", value: "none" },
            { label: "Business Central", value: "businessCentral" },
            { label: "Manual", value: "manual" }
          ]}
          onChange={(v) => set("capabilities.inventory.source", v)}
        />

        <BaseToggleField
          label="Shippable"
          path="Defaults.capabilities.shipping.shippable"
          value={getByPath(defaults, "capabilities.shipping.shippable", true)}
          onChange={(v) => set("capabilities.shipping.shippable", v)}
        />

        <BaseToggleField
          label="Allow Pickup"
          path="Defaults.capabilities.shipping.allowPickup"
          value={getByPath(defaults, "capabilities.shipping.allowPickup", false)}
          onChange={(v) => set("capabilities.shipping.allowPickup", v)}
        />

        <BaseSelectField
          label="Pricing Model"
          path="Defaults.capabilities.pricing.model"
          value={getByPath(defaults, "capabilities.pricing.model", "simple")}
          options={[
            { label: "Simple", value: "simple" },
            { label: "Tiers", value: "tiers" },
            { label: "Quote", value: "quote" }
          ]}
          onChange={(v) => set("capabilities.pricing.model", v)}
        />

        <BaseToggleField
          label="Variants Enabled"
          path="Defaults.capabilities.variants.enabled"
          value={getByPath(defaults, "capabilities.variants.enabled", false)}
          onChange={(v) => set("capabilities.variants.enabled", v)}
        />

        <BaseToggleField
          label="Digital Delivery"
          path="Defaults.capabilities.digital.enabled"
          value={getByPath(defaults, "capabilities.digital.enabled", false)}
          onChange={(v) => set("capabilities.digital.enabled", v)}
        />

        <BaseToggleField
          label="Personalization Enabled"
          path="Defaults.capabilities.personalization.enabled"
          value={getByPath(defaults, "capabilities.personalization.enabled", false)}
          onChange={(v) => set("capabilities.personalization.enabled", v)}
        />

        <BaseSelectField
          label="Personalization Mode"
          path="Defaults.capabilities.personalization.mode"
          value={getByPath(defaults, "capabilities.personalization.mode", "none")}
          options={[
            { label: "None", value: "none" },
            { label: "Text", value: "text" },
            { label: "Fields", value: "fields" },
            { label: "Design Upload", value: "designUpload" }
          ]}
          onChange={(v) => set("capabilities.personalization.mode", v)}
        />
      </div>
    </div>
  );
}
