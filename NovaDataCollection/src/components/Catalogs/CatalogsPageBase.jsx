
import { useEffect, useState, useRef } from 'react';
import { useCatalog } from '../../hooks/useCatalog';
import { fetchCatalogs, fetchCatalogById } from '../../services/catalogApi';
import { fetchProductsByIds } from '../../services/productApi';

export default function CatalogsPageBase({ renderLayout }) {
  const { state, dispatch } = useCatalog();

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [hasMore, setHasMore] = useState(true);
  const [currentParentId, setCurrentParentId] = useState(null);
  const [currentParentName, setCurrentParentName] = useState(null);
  const [breadcrumbStack, setBreadcrumbStack] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState(null);
  const [lastItem, setLastItem] = useState(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!lastItem || !hasMore || state.loading) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setPage(prev => prev + 1);
    });
    observer.observe(lastItem);
    return () => observer.disconnect();
  }, [lastItem, hasMore, state.loading]);

  useEffect(() => {
    hasMounted.current = true;
    dispatch({ type: 'LOADING' });

    fetchCatalogs(1, pageSize, currentParentId).then(res => {
      const newCatalogs = Array.isArray(res) ? res : res.catalogs || [];
      console.log('✅ Fetched catalogs (page 1):', newCatalogs);
      setHasMore(newCatalogs.length === pageSize);
      setPage(1);
      dispatch({ type: 'FETCH_CATALOGS_SUCCESS', payload: newCatalogs });

      if (currentParentId) {
        fetchCatalogById(currentParentId).then(parent => {
          if (parent?.products?.length) {
            fetchProductsByIds(parent.products.map(p => p.ProductID))
              .then(setProducts)
              .catch(() => setProducts([]));
          } else {
            setProducts([]);
          }
        }).catch(() => setProducts([]));
      } else setProducts([]);
    }).catch((err) => {
      console.log(err.message);
      dispatch({ type: 'ERROR', payload: err.message });
    });
  }, [currentParentId, dispatch]);

  useEffect(() => {
    if (page === 1 || !hasMounted.current) return;
    dispatch({ type: 'LOADING' });

    fetchCatalogs(page, pageSize, currentParentId).then(res => {
      const newCatalogs = Array.isArray(res) ? res : res.catalogs || [];
      console.log(`✅ Fetched catalogs (page ${page}):`, newCatalogs);
      setHasMore(newCatalogs.length === pageSize);
      dispatch({
        type: 'FETCH_CATALOGS_SUCCESS',
        payload: [...state.catalogs, ...newCatalogs]
      });
    }).catch((err) => {
      console.log(err.message);
      dispatch({ type: 'ERROR', payload: err.message });
    });
  }, [page, currentParentId, dispatch]);

  const handleNavigateDown = (newParentId, name) => {
    if (!newParentId) return;
    if (breadcrumbStack.length && breadcrumbStack[breadcrumbStack.length - 1]?.id === newParentId) return;
    setBreadcrumbStack(prev => [...prev, { id: currentParentId, name }]);
    setCurrentParentId(newParentId);
    setCurrentParentName(name);
  };

  const handleNavigateUpTo = (index) => {
    const target = breadcrumbStack[index];
    if (!target) {
      setBreadcrumbStack([]);
      setCurrentParentId(null);
      setCurrentParentName(null);
      return;
    }
    setBreadcrumbStack(breadcrumbStack.slice(0, index));
    setCurrentParentId(target.id);
    setCurrentParentName(target.name);
  };

  const handleAddCatalog = () => {
    setEditingCatalog(null);
    setIsModalOpen(true);
  };

  const handleEditCatalog = (catalog) => {
    setEditingCatalog(catalog);
    setIsModalOpen(true);
  };

  const handleCloseModal = async () => {
    setIsModalOpen(false);
    setEditingCatalog(null);

    try {
      const res = await fetchCatalogs(1, pageSize, currentParentId);
      const newCatalogs = Array.isArray(res) ? res : res.catalogs || [];
      dispatch({ type: 'FETCH_CATALOGS_SUCCESS', payload: newCatalogs });
    } catch (err) {
      console.error('Error reloading catalogs:', err);
      dispatch({ type: 'ERROR', payload: err.message });
    }
  };

  return renderLayout({
    state,
    loading: state.loading,
    breadcrumbs: breadcrumbStack,
    products,
    onNavigate: handleNavigateDown,
    onNavigateUp: handleNavigateUpTo,
    setLastItem,
    currentParentId,
    currentParentName,
    isModalOpen,
    onAddCatalog: handleAddCatalog,
    onEditCatalog: handleEditCatalog,
    onCloseModal: handleCloseModal,
    editingCatalog
  });
}
