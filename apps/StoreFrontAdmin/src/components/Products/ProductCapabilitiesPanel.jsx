// src/components/Products/ProductCapabilitiesPanel.jsx
import ToggleOverrideField from "./ToggleOverrideField";
import SelectOverrideField from "./SelectOverrideField";

export default function ProductCapabilitiesPanel({
  baseDefaults,
  overrides,
  resolved,
  onOverrideField,
  onRevertField,
  onChangeField,
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold">Capabilities</div>
      <div className="mt-0.5 text-xs opacity-70">
        Feature switches that control what this product can do.
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ToggleOverrideField
          label="Purchasable"
          path="capabilities.purchasable"
          baseDefaults={baseDefaults}
          overrides={overrides}
          resolved={resolved}
          hint="If disabled, product cannot be ordered."
          onOverride={() => onOverrideField("capabilities.purchasable")}
          onRevert={() => onRevertField("capabilities.purchasable")}
          onChange={(v) => onChangeField("capabilities.purchasable", v)}
        />

        <ToggleOverrideField
          label="Requires Approval"
          path="capabilities.requiresApproval"
          baseDefaults={baseDefaults}
          overrides={overrides}
          resolved={resolved}
          hint="If enabled, ordering requires approval workflow."
          onOverride={() => onOverrideField("capabilities.requiresApproval")}
          onRevert={() => onRevertField("capabilities.requiresApproval")}
          onChange={(v) => onChangeField("capabilities.requiresApproval", v)}
        />

        <ToggleOverrideField
          label="Allow Notes"
          path="capabilities.allowNotes"
          baseDefaults={baseDefaults}
          overrides={overrides}
          resolved={resolved}
          hint="Allow freeform notes on orders."
          onOverride={() => onOverrideField("capabilities.allowNotes")}
          onRevert={() => onRevertField("capabilities.allowNotes")}
          onChange={(v) => onChangeField("capabilities.allowNotes", v)}
        />

        <ToggleOverrideField
          label="Has Images"
          path="capabilities.hasImages"
          baseDefaults={baseDefaults}
          overrides={overrides}
          resolved={resolved}
          hint="If enabled, product can show image gallery."
          onOverride={() => onOverrideField("capabilities.hasImages")}
          onRevert={() => onRevertField("capabilities.hasImages")}
          onChange={(v) => onChangeField("capabilities.hasImages", v)}
        />

        <ToggleOverrideField
          label="Track Inventory"
          path="capabilities.inventory.track"
          baseDefaults={baseDefaults}
          overrides={overrides}
          resolved={resolved}
          hint="Turn on inventory awareness."
          onOverride={() => onOverrideField("capabilities.inventory.track")}
          onRevert={() => onRevertField("capabilities.inventory.track")}
          onChange={(v) => onChangeField("capabilities.inventory.track", v)}
        />

        <SelectOverrideField
          label="Inventory Source"
          path="capabilities.inventory.source"
          options={[
            { label: "None", value: "none" },
            { label: "Business Central", value: "businessCentral" },
            { label: "Manual", value: "manual" },
          ]}
          baseDefaults={baseDefaults}
          overrides={overrides}
          resolved={resolved}
          hint="Where inventory levels come from."
          onOverride={() => onOverrideField("capabilities.inventory.source")}
          onRevert={() => onRevertField("capabilities.inventory.source")}
          onChange={(v) => onChangeField("capabilities.inventory.source", v)}
        />

        <ToggleOverrideField
          label="Shippable"
          path="capabilities.shipping.shippable"
          baseDefaults={baseDefaults}
          overrides={overrides}
          resolved={resolved}
          hint="Physical shipping allowed."
          onOverride={() => onOverrideField("capabilities.shipping.shippable")}
          onRevert={() => onRevertField("capabilities.shipping.shippable")}
          onChange={(v) => onChangeField("capabilities.shipping.shippable", v)}
        />

        <ToggleOverrideField
          label="Allow Pickup"
          path="capabilities.shipping.allowPickup"
          baseDefaults={baseDefaults}
          overrides={overrides}
          resolved={resolved}
          hint="Pickup (no shipping) option allowed."
          onOverride={() => onOverrideField("capabilities.shipping.allowPickup")}
          onRevert={() => onRevertField("capabilities.shipping.allowPickup")}
          onChange={(v) => onChangeField("capabilities.shipping.allowPickup", v)}
        />

        <SelectOverrideField
          label="Pricing Model"
          path="capabilities.pricing.model"
          options={[
            { label: "Simple", value: "simple" },
            { label: "Tiers", value: "tiers" },
            { label: "Quote", value: "quote" },
          ]}
          baseDefaults={baseDefaults}
          overrides={overrides}
          resolved={resolved}
          hint="How price is calculated."
          onOverride={() => onOverrideField("capabilities.pricing.model")}
          onRevert={() => onRevertField("capabilities.pricing.model")}
          onChange={(v) => onChangeField("capabilities.pricing.model", v)}
        />

        <ToggleOverrideField
          label="Variants Enabled"
          path="capabilities.variants.enabled"
          baseDefaults={baseDefaults}
          overrides={overrides}
          resolved={resolved}
          hint="Size/color/options on product."
          onOverride={() => onOverrideField("capabilities.variants.enabled")}
          onRevert={() => onRevertField("capabilities.variants.enabled")}
          onChange={(v) => onChangeField("capabilities.variants.enabled", v)}
        />

        <ToggleOverrideField
          label="Digital Delivery"
          path="capabilities.digital.enabled"
          baseDefaults={baseDefaults}
          overrides={overrides}
          resolved={resolved}
          hint="Deliver via download/link (not shipped)."
          onOverride={() => onOverrideField("capabilities.digital.enabled")}
          onRevert={() => onRevertField("capabilities.digital.enabled")}
          onChange={(v) => onChangeField("capabilities.digital.enabled", v)}
        />

        <ToggleOverrideField
          label="Personalization Enabled"
          path="capabilities.personalization.enabled"
          baseDefaults={baseDefaults}
          overrides={overrides}
          resolved={resolved}
          hint="Product can be personalized."
          onOverride={() => onOverrideField("capabilities.personalization.enabled")}
          onRevert={() => onRevertField("capabilities.personalization.enabled")}
          onChange={(v) => onChangeField("capabilities.personalization.enabled", v)}
        />

        <SelectOverrideField
          label="Personalization Mode"
          path="capabilities.personalization.mode"
          options={[
            { label: "None", value: "none" },
            { label: "Text", value: "text" },
            { label: "Fields", value: "fields" },
            { label: "Design Upload", value: "designUpload" },
          ]}
          baseDefaults={baseDefaults}
          overrides={overrides}
          resolved={resolved}
          hint="What type of personalization UI appears."
          onOverride={() => onOverrideField("capabilities.personalization.mode")}
          onRevert={() => onRevertField("capabilities.personalization.mode")}
          onChange={(v) => onChangeField("capabilities.personalization.mode", v)}
        />
      </div>
    </div>
  );
}
