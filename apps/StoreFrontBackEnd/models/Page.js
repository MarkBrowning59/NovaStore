// models/Page.js
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// A CMS-like page composed of blocks.
// Year 1: draft/published flag; simple publish workflow.
const pageSchema = new Schema(
  {
    slug: { type: String, required: true, trim: true, unique: true },
    title: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      required: true,
    },

    // Array of block instances: [{ id, type, props }]
    blocks: { type: [Schema.Types.Mixed], default: [] },

    // Optional timestamps for publish events
    publishedAt: { type: Date, default: null },
  },
  {
    collection: 'pages',
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model('Page', pageSchema);
