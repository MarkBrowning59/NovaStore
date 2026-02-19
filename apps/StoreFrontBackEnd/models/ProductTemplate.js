// models/ProductTemplate.js
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// A reusable layout template for product pages.
// Stores a list of blocks (JSON) that StoreFrontCore knows how to render.
const productTemplateSchema = new Schema(
  {
    key: { type: String, required: true, trim: true, unique: true },
    name: { type: String, required: true, trim: true },

    // Array of block instances: [{ id, type, props }]
    blocks: { type: [Schema.Types.Mixed], default: [] },

    isDefault: { type: Boolean, default: false },
  },
  {
    collection: 'productTemplates',
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model('ProductTemplate', productTemplateSchema);
