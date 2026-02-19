import React, { createContext, useReducer } from 'react';

const CatalogContext = createContext();

/**
 * Tree-enabled catalog state (normalized).
 * Keeps legacy fields (catalogs, catalogProducts, products) so existing UI still works,
 * AND builds an in-memory tree for breadcrumbs + sidebar.
 */
const initialState = {
  // Legacy: last fetched list (kept for compatibility)
  catalogs: [],

  // Legacy caches
  catalogProducts: {},
  products: {},

  // NEW: normalized catalog tree
  catalogNodes: {},   // { [id]: { id, name, parentId, statusId, childIds: [], raw } }
  rootIds: [],        // catalog ids where parentId == null
  childrenLoaded: {}, // { [parentKey]: true } parentKey is "__ROOT__" or parentId
  selectedCatalogId: null,

  loading: false,
  error: null,
};

const ROOT_KEY = '__ROOT__';

function uniq(arr) {
  return Array.from(new Set((arr || []).filter(Boolean)));
}

function upsertNode(nodes, incoming) {
  const id = String(incoming?._id ?? incoming?.id ?? '');
  if (!id) return nodes;

const parentIdRaw =
  incoming?.parentId ?? incoming?.ParentId ?? incoming?.parentID ?? null;

const parentId = parentIdRaw == null ? null : String(parentIdRaw);

  const name = incoming?.name ?? incoming?.Name ?? incoming?.title ?? id;
  const statusId = incoming?.StatusID ?? incoming?.statusId ?? undefined;

  const incomingChildren = Array.isArray(incoming?.children)
  ? incoming.children.map(String)
  : null;

  const prev = nodes[id] || { id, childIds: [] };

return {
  ...nodes,
  [id]: {
    ...prev,
    id,
    name,
    parentId,
    statusId,
    raw: { ...(prev.raw || {}), ...(incoming || {}) },
    childIds: incomingChildren ? incomingChildren : (prev.childIds || []),
  },
};
}

function catalogReducer(state, action) {
  switch (action.type) {
    // ----- Legacy actions -----
    case 'FETCH_CATALOGS_SUCCESS':
      return { ...state, catalogs: action.payload, loading: false };

    case 'FETCH_PRODUCTS_SUCCESS':
      return {
        ...state,
        catalogProducts: {
          ...state.catalogProducts,
          [action.catalogId]: action.payload,
        },
        loading: false,
      };

    case 'FETCH_PRODUCT_SUCCESS':
      return {
        ...state,
        products: {
          ...state.products,
          [action.payload._id]: action.payload,
        },
        loading: false,
      };

    // ----- NEW: tree actions -----
    case 'MERGE_CATALOG_CHILDREN': {
      const parentId = action.parentId == null ? null : String(action.parentId);
      const key = parentId == null ? ROOT_KEY : parentId;
      const catalogs = Array.isArray(action.payload) ? action.payload : [];

      // Upsert nodes
      let nextNodes = state.catalogNodes;
      for (const c of catalogs) {
        nextNodes = upsertNode(nextNodes, c);
      }

      // Child ids returned for this parent
      const childIds = catalogs
        .map((c) => String(c?._id ?? c?.id ?? ''))
        .filter(Boolean);

      // Attach children to parent or roots
      let nextRootIds = state.rootIds;

      if (parentId == null) {
        nextRootIds = uniq([...state.rootIds, ...childIds]);
      } else {
        const parentNode =
          nextNodes[parentId] || { id: parentId, name: parentId, parentId: null, childIds: [] };

        nextNodes = {
          ...nextNodes,
          [parentId]: {
            ...parentNode,
            childIds: uniq([...(parentNode.childIds || []), ...childIds]),
          },
        };
      }

      return {
        ...state,
        catalogNodes: nextNodes,
        rootIds: nextRootIds,
        childrenLoaded: { ...state.childrenLoaded, [key]: true },
        catalogs, // keep legacy list in sync with what was fetched
        loading: false,
        error: null,
      };
    }

    case 'SELECT_CATALOG':
      return {
        ...state,
        selectedCatalogId: action.payload == null ? null : String(action.payload),
      };

    case 'RESET_CATALOG_TREE':
      return {
        ...state,
        catalogNodes: {},
        rootIds: [],
        childrenLoaded: {},
        selectedCatalogId: null,
      };

    // ----- common -----
    case 'LOADING':
      return { ...state, loading: true };

    case 'ERROR':
      return { ...state, error: action.payload, loading: false };

    default:
      return state;
  }
}

export function CatalogProvider({ children }) {
  const [state, dispatch] = useReducer(catalogReducer, initialState);

  return (
    <CatalogContext.Provider value={{ state, dispatch }}>
      {children}
    </CatalogContext.Provider>
  );
}

export default CatalogContext;
