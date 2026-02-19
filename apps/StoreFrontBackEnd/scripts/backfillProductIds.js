// scripts/backfillProductIds.js
require('dotenv').config();
const connectMongoose = require('../config/mongoose');
const Product = require('../models/Product');

async function backfillProductIds() {
  await connectMongoose();
  console.log('✅ Connected to MongoDB (Mongoose). Starting backfill...');

  // Use lean() so we get plain JS objects, not Mongoose documents
  const cursor = Product.find({}).lean().cursor();

  let processed = 0;
  let updatedCount = 0;

  for await (const doc of cursor) {
    processed++;

    const ids = Array.isArray(doc.IDs) ? [...doc.IDs] : [];
    let updated = false;

    // 1) Ensure StoreFront ID
    const hasStoreFront = ids.some((i) => i.System === 'StoreFront');
    if (!hasStoreFront) {
      ids.push({
        System: 'StoreFront',
        ID: doc._id, // canonical storefront ID is the Mongo _id
      });
      updated = true;
    }

    // 2) Ensure XMPie ID when _id starts with XMPie
    const hasXMPie = ids.some((i) => i.System === 'XMPie');
    if (!hasXMPie && typeof doc._id === 'string' && doc._id.startsWith('XMPie')) {
      const numericId = doc._id.replace(/^XMPie/, '');
      ids.push({
        System: 'XMPie',
        ID: numericId,
      });
      updated = true;
    }

    // Optional: dedupe by System (one entry per System)
    if (updated) {
      const uniqueBySystem = new Map();
      for (const entry of ids) {
        if (!entry || !entry.System) continue;
        uniqueBySystem.set(entry.System, entry);
      }

      const finalIds = Array.from(uniqueBySystem.values());

      await Product.updateOne(
        { _id: doc._id },
        { $set: { IDs: finalIds } }
      );

      updatedCount++;

      if (updatedCount % 100 === 0) {
        console.log(`...updated ${updatedCount} products so far`);
      }
    }
  }

  console.log(`🎯 Backfill complete. Processed: ${processed}, Updated: ${updatedCount}`);
  process.exit(0);
}

backfillProductIds().catch((err) => {
  console.error('❌ Backfill failed:', err);
  process.exit(1);
});
