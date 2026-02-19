// src/components/Catalogs/CatalogsPageBase.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNavigation } from '../../context/NavigationContext';
import { useCatalog } from '../../hooks/useCatalog';
import { fetchCatalogById, fetchCatalogs, createCatalog, updateCatalog } from '../../services/catalogApi';
import { fetchProductsByIds } from '../../services/productApi';
import CatalogFormModal from './CatalogFormModal';

const getStatusId = (cat) => cat?.StatusID ?? cat?.statusID ?? cat?.StatusId ?? cat?.statusId ?? null;
const getParentId = (cat) => cat?.parentId ?? cat?.ParentId ?? cat?.ParentID ?? cat?.parentID ?? null;

const normalizeCatalog = (cat) => {
  if (!cat) return cat;
  return { ...cat, StatusID: getStatusId(cat), parentId: getParentId(cat) };
};

function buildBreadcrumbsFromTree(catalogNodes, selectedId) {
  const home = { id: null, name: 'Home' };
  if (!selectedId) return [home];

  const chain = [];
  let cur = String(selectedId);
  const seen = new Set();

  while (cur && !seen.has(cur)) {
    seen.add(cur);
    const node = catalogNodes?.[cur];
    if (!node) break;

    chain.unshift({ id: node.id, name: node.name || node.id });
    cur = node.parentId == null ? null : String(node.parentId);
  }

  return [home, ...chain];
}

const LS_KEYS = {
  status: 'nstore.catalogs.statusFilter',
  search: 'nstore.catalogs.searchQuery',
};

export default function CatalogsPageBase({ renderLayout }) {
  const navigate = useNavigate();
  const { id: routeCatalogId } = useParams();

  const { dispatch: navDispatch } = useNavigation();
  const { state, dispatch } = useCatalog();

  const pageSize = 10;

  const [selectedCatalogId, setSelectedCatalogId] = useState(null);
  const [listParentId, setListParentId] = useState(null);
  const [selectedCatalog, setSelectedCatalog] = useState(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [visibleCatalogs, setVisibleCatalogs] = useState([]);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState(() => {
    try { return localStorage.getItem(LS_KEYS.search) || ''; } catch { return ''; }
  });
  const [statusFilter, setStatusFilter] = useState(() => {
    try { return localStorage.getItem(LS_KEYS.status) || 'all'; } catch { return 'all'; }
  });

  const [lastItem, setLastItem] = useState(null);
  const hasMounted = useRef(false);

  const loading = state.loading;
  const error = state.error;
  const catalogNodes = state.catalogNodes || {};

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [modalCatalog, setModalCatalog] = useState(null);

  const openCreateModal = () => {
    setModalMode('create');
    setModalCatalog(null);
    setModalOpen(true);
  };
  const openEditModal = (catalog) => {
    if (!catalog?._id) return;
    setModalMode('edit');
    setModalCatalog(catalog);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  // Persist filters
  useEffect(() => { try { localStorage.setItem(LS_KEYS.search, searchQuery ?? ''); } catch {} }, [searchQuery]);
  useEffect(() => { try { localStorage.setItem(LS_KEYS.status, statusFilter ?? 'all'); } catch {} }, [statusFilter]);

  // URL -> selected catalog
  useEffect(() => {
    const id = routeCatalogId ? String(routeCatalogId) : null;

    setSelectedCatalogId(id);
    dispatch({ type: 'SELECT_CATALOG', payload: id });

    if (id == null) navDispatch({ type: 'RESET_NAV' });
    else navDispatch({ type: 'SET_CATALOG', payload: id });

    setPage(1);
    setVisibleCatalogs([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeCatalogId]);

  // Load selected catalog + ancestors into tree + products
  useEffect(() => {
    if (!selectedCatalogId) {
      setSelectedCatalog(null);
      setListParentId(null);
      setProducts([]);
      setProductsLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const raw = await fetchCatalogById(selectedCatalogId);
        if (cancelled) return;

        const cat = normalizeCatalog(raw);
        setSelectedCatalog(cat || null);
        setListParentId(cat?._id ? String(cat._id) : null);

        let cur = cat;
        const seen = new Set();

        while (cur && cur._id && !seen.has(String(cur._id))) {
          if (cancelled) return;
          seen.add(String(cur._id));

          dispatch({
            type: 'MERGE_CATALOG_CHILDREN',
            parentId: cur.parentId ?? null,
            payload: [cur],
          });

          if (!cur.parentId) break;

          const parentRaw = await fetchCatalogById(String(cur.parentId));
          cur = normalizeCatalog(parentRaw);
        }

        // Products
        setProductsLoading(true);

        const ids = Array.isArray(cat?.products)
          ? cat.products.map((p) => p?.ProductID || p?._id).filter(Boolean)
          : [];

        if (!ids.length) {
          setProducts([]);
          setProductsLoading(false);
          return;
        }

        const productDocs = await fetchProductsByIds(ids);
        if (cancelled) return;

        setProducts(productDocs || []);
        setProductsLoading(false);
      } catch (e) {
        console.error('Failed to load selected catalog/path/products:', e);
        if (!cancelled) {
          setSelectedCatalog(null);
          setListParentId(null);
          setProducts([]);
          setProductsLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [selectedCatalogId, dispatch]);

  // Fetch sidebar catalogs page 1 when listParentId changes
  useEffect(() => {
    hasMounted.current = true;
    dispatch({ type: 'LOADING' });
    setPage(1);

    fetchCatalogs(1, pageSize, listParentId)
      .then((res) => {
        const listRaw = Array.isArray(res) ? res : res?.catalogs || res?.data?.catalogs || [];
        const list = listRaw.map(normalizeCatalog);

        setHasMore(list.length === pageSize);
        dispatch({ type: 'MERGE_CATALOG_CHILDREN', parentId: listParentId, payload: list });
        setVisibleCatalogs(list);
      })
      .catch((err) => {
        console.error('Error fetching catalogs:', err);
        dispatch({ type: 'ERROR', payload: err.message });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listParentId]);

  // Fetch additional pages
  useEffect(() => {
    if (!hasMounted.current) return;
    if (page === 1) return;

    dispatch({ type: 'LOADING' });

    fetchCatalogs(page, pageSize, listParentId)
      .then((res) => {
        const listRaw = Array.isArray(res) ? res : res?.catalogs || res?.data?.catalogs || [];
        const list = listRaw.map(normalizeCatalog);

        setHasMore(list.length === pageSize);
        dispatch({ type: 'MERGE_CATALOG_CHILDREN', parentId: listParentId, payload: list });
        setVisibleCatalogs((prev) => [...prev, ...list]);
      })
      .catch((err) => {
        console.error('Error fetching catalogs page:', err);
        dispatch({ type: 'ERROR', payload: err.message });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Intersection observer for pagination
  useEffect(() => {
    if (!lastItem || !hasMore || loading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setPage((prev) => prev + 1);
    });

    observer.observe(lastItem);
    return () => observer.disconnect();
  }, [lastItem, hasMore, loading]);

  const breadcrumbs = useMemo(() => buildBreadcrumbsFromTree(catalogNodes, selectedCatalogId), [catalogNodes, selectedCatalogId]);

  const goToCatalog = (id) => {
    if (id == null) navigate('/catalogs');
    else navigate(`/catalogs/${id}`);
  };

  const handleCatalogClick = (catalog) => {
    if (!catalog?._id) return;
    goToCatalog(catalog._id);
  };

  const handleNavigateUp = () => {
    const pid = selectedCatalog?.parentId ? String(selectedCatalog.parentId) : null;
    goToCatalog(pid);
  };

  const handleBreadcrumbClick = (index) => {
    const target = breadcrumbs[index];
    if (!target) return;
    goToCatalog(target.id);
  };

  // Client-side filters
  const filteredCatalogs = useMemo(() => {
    const q = (searchQuery || '').toLowerCase();

    return visibleCatalogs.filter((cat) => {
      if (!cat) return false;

      if (q) {
        const nm = (cat?.name || '').toLowerCase();
        if (!nm.includes(q)) return false;
      }

      if (statusFilter === 'all') return true;
      return String(cat?.StatusID) === String(statusFilter);
    });
  }, [visibleCatalogs, searchQuery, statusFilter]);

  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    setPage((prev) => prev + 1);
  };

  const refreshCurrentList = async () => {
    const res = await fetchCatalogs(1, pageSize, listParentId);
    const listRaw = Array.isArray(res) ? res : res?.catalogs || res?.data?.catalogs || [];
    const list = listRaw.map(normalizeCatalog);
    setHasMore(list.length === pageSize);
    dispatch({ type: 'MERGE_CATALOG_CHILDREN', parentId: listParentId, payload: list });
    setVisibleCatalogs(list);
    setPage(1);
  };

  // Modal submit: create/update
  const handleModalSubmit = async (payload) => {
    try {
      if (modalMode === 'create') {
        const finalPayload = { ...payload, parentId: selectedCatalogId ? String(selectedCatalogId) : null };

        await createCatalog(finalPayload);
        closeModal();
        await refreshCurrentList();
      } else if (modalMode === 'edit') {
        const id = modalCatalog?._id;
        if (!id) return;

        await updateCatalog(id, payload);
        closeModal();

        await refreshCurrentList();
        if (selectedCatalogId && String(selectedCatalogId) === String(id)) {
          const raw = await fetchCatalogById(String(id));
          setSelectedCatalog(normalizeCatalog(raw));
        }
      }
    } catch (e) {
      console.error('Catalog save failed:', e);
      alert(e?.message || 'Catalog save failed.');
    }
  };

  // Drag-drop reorder handler: updates DisplayOrder 1..N for the current filtered view
  const handleReorderCatalogs = async (orderedFilteredCatalogs) => {
    if (!Array.isArray(orderedFilteredCatalogs) || orderedFilteredCatalogs.length === 0) return;

    // Optimistic reorder: replace the filtered subset inside visibleCatalogs with the new ordering.
    const orderedIds = orderedFilteredCatalogs.map((c) => String(c._id));
    const byId = new Map(visibleCatalogs.map((c) => [String(c._id), c]));
    const filteredSet = new Set(orderedIds);

    const nextVisible = [];
    let inserted = false;

    for (const c of visibleCatalogs) {
      const id = String(c._id);
      if (filteredSet.has(id)) {
        if (!inserted) {
          for (const rid of orderedIds) nextVisible.push(byId.get(rid));
          inserted = true;
        }
        continue;
      }
      nextVisible.push(c);
    }

    if (!inserted) {
      for (const rid of orderedIds) nextVisible.push(byId.get(rid));
    }

    setVisibleCatalogs(nextVisible);

    // Persist DisplayOrder for reordered items only
    const updates = orderedFilteredCatalogs.map((c, idx) => ({ id: c._id, DisplayOrder: idx + 1 }));

    try {
      await Promise.all(updates.map((u) => updateCatalog(u.id, { DisplayOrder: u.DisplayOrder })));

      setVisibleCatalogs((prev) =>
        prev.map((c) => {
          const hit = updates.find((u) => String(u.id) === String(c._id));
          return hit ? { ...c, DisplayOrder: hit.DisplayOrder } : c;
        })
      );
    } catch (e) {
      console.error('Reorder save failed; reloading list:', e);
      await refreshCurrentList();
    }
  };

  const defaultParentId = selectedCatalogId ? String(selectedCatalogId) : null;

  return (
    <>
      {renderLayout({
        catalogs: filteredCatalogs,
        loading,
        error,
        hasMore,
        onLoadMore: handleLoadMore,

        onCatalogClick: handleCatalogClick,
        onNavigateUp: handleNavigateUp,

        parentCatalog: selectedCatalog,
        products,
        productsLoading,

        searchQuery,
        onSearchChange: setSearchQuery,
        statusFilter,
        onStatusFilterChange: setStatusFilter,

        breadcrumbs,
        onBreadcrumbClick: handleBreadcrumbClick,

        setLastItem,

        onAddCatalog: openCreateModal,
        onEditCatalog: openEditModal,
        onReorderCatalogs: handleReorderCatalogs,
      })}

      <CatalogFormModal
        open={modalOpen}
        mode={modalMode}
        initialCatalog={modalCatalog}
        defaultParentId={defaultParentId}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />
    </>
  );
}
