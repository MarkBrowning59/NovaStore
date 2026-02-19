// services/productMapper.js

/**
 * Map combined core + external data into a canonical Product DTO.
 * For now, core carries almost everything; sqlInfo & bcInfo are stubs.
 */
exports.mapToCanonicalProduct = (core, sqlInfo, bcInfo) => {
  if (!core) return null;

  return {
    id: core._id,
    // From ProductDefinition
    name: core.ProductDefinition?.Name || null,
    shortDescription: core.ProductDefinition?.ShortDescription || null,
    description: core.ProductDefinition?.Description || null,

    // Catalog relationships
    catalogIds: core.CatalogIds || [],

    // External IDs (XMPie, StoreFront, BC, SQL, etc.)
    ids: core.IDs || [],

    // Future fields from BC / SQL
    pricing: {
      // bcInfo?.UnitPrice etc. can go here later
      list: null,
      currency: 'USD',
    },
    inventory: {
      available: null,
    },

    // Keep the raw data for debugging / admin use
    raw: {
      core,
      sql: sqlInfo || null,
      bc: bcInfo || null,
    },
  };
};
