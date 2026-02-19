// src/data/productBasePresets.js
// Simple starter presets to bootstrap new ProductBases.
export const PRODUCT_BASE_PRESETS = [
  {
    id: "blank",
    label: "Blank (start from scratch)",
    build: () => ({
      ProductDefinition: { Name: "", ShortDescription: "", DescriptionHtml: "" },
      capabilities: {
        purchasable: true,
        requiresApproval: false,
        allowNotes: true,
        hasImages: true,
        personalization: { enabled: false, mode: "none" },
        inventory: { track: false, source: "none" },
        shipping: { shippable: true, allowPickup: false },
        pricing: { model: "simple" },
        variants: { enabled: false },
        digital: { enabled: false }
      },
      config: {
        pricing: { currency: "USD", basePrice: 0, tiers: [], quoteInstructions: "" },
        inventory: { bcItemNo: null, reorderPoint: null },
        variants: { options: [] },
        media: { primaryImageUrl: "", imageUrls: [] },
        fulfillment: { leadTimeDays: 0, packSlipTemplate: null },
        digital: { downloadUrl: "", licenseText: "" },
        personalization: { fields: [] }
      }
    })
  },
  {
    id: "apparel",
    label: "Custom Apparel (preset)",
    build: () => ({
      ProductDefinition: { Name: "Custom Apparel", ShortDescription: "", DescriptionHtml: "" },
      capabilities: {
        purchasable: true,
        requiresApproval: false,
        allowNotes: true,
        hasImages: true,
        personalization: { enabled: true, mode: "fields" },
        inventory: { track: false, source: "none" },
        shipping: { shippable: true, allowPickup: false },
        pricing: { model: "tiers" },
        variants: { enabled: true },
        digital: { enabled: false }
      },
      config: {
        pricing: { currency: "USD", basePrice: 0, tiers: [], quoteInstructions: "" },
        inventory: { bcItemNo: null, reorderPoint: null },
        variants: {
          options: [
            { name: "Size", values: ["S", "M", "L", "XL"] },
            { name: "Color", values: ["Black", "Navy", "White"] }
          ]
        },
        media: { primaryImageUrl: "", imageUrls: [] },
        personalization: { fields: [] },
        fulfillment: { leadTimeDays: 0, packSlipTemplate: null }
      }
    })
  },
  {
    id: "sign",
    label: "Printed Sign (preset)",
    build: () => ({
      ProductDefinition: { Name: "Printed Sign", ShortDescription: "", DescriptionHtml: "" },
      capabilities: {
        purchasable: true,
        requiresApproval: false,
        allowNotes: true,
        hasImages: true,
        personalization: { enabled: true, mode: "designUpload" },
        inventory: { track: false, source: "none" },
        shipping: { shippable: true, allowPickup: true },
        pricing: { model: "simple" },
        variants: { enabled: true },
        digital: { enabled: false }
      },
      config: {
        pricing: { currency: "USD", basePrice: 0, tiers: [], quoteInstructions: "" },
        inventory: { bcItemNo: null, reorderPoint: null },
        variants: {
          options: [
            { name: "Size", values: ["12x18", "18x24", "24x36"] },
            { name: "Material", values: ["Coroplast", "PVC", "Aluminum"] }
          ]
        },
        media: { primaryImageUrl: "", imageUrls: [] },
        personalization: { fields: [] },
        fulfillment: { leadTimeDays: 0, packSlipTemplate: null }
      }
    })
  },
  {
    id: "digital",
    label: "Digital Download (preset)",
    build: () => ({
      ProductDefinition: { Name: "Digital Download", ShortDescription: "", DescriptionHtml: "" },
      capabilities: {
        purchasable: true,
        requiresApproval: false,
        allowNotes: false,
        hasImages: true,
        personalization: { enabled: false, mode: "none" },
        inventory: { track: false, source: "none" },
        shipping: { shippable: false, allowPickup: false },
        pricing: { model: "simple" },
        variants: { enabled: false },
        digital: { enabled: true }
      },
      config: {
        pricing: { currency: "USD", basePrice: 0, tiers: [], quoteInstructions: "" },
        media: { primaryImageUrl: "", imageUrls: [] },
        digital: { downloadUrl: "", licenseText: "" }
      }
    })
  },
  {
    id: "sku",
    label: "Generic SKU (preset)",
    build: () => ({
      ProductDefinition: { Name: "Generic SKU", ShortDescription: "", DescriptionHtml: "" },
      capabilities: {
        purchasable: true,
        requiresApproval: false,
        allowNotes: true,
        hasImages: true,
        personalization: { enabled: false, mode: "none" },
        inventory: { track: true, source: "businessCentral" },
        shipping: { shippable: true, allowPickup: false },
        pricing: { model: "simple" },
        variants: { enabled: false },
        digital: { enabled: false }
      },
      config: {
        pricing: { currency: "USD", basePrice: 0, tiers: [], quoteInstructions: "" },
        inventory: { bcItemNo: null, reorderPoint: null },
        media: { primaryImageUrl: "", imageUrls: [] },
        fulfillment: { leadTimeDays: 0, packSlipTemplate: null }
      }
    })
  }
];
