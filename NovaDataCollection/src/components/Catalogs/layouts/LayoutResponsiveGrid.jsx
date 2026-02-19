// LayoutResponsiveGrid.jsx
import CatalogList from '../CatalogList';
import ProductList from '../../Products/ProductList';
import Breadcrumbs from '../Breadcrumbs';

export default function LayoutResponsiveGrid({ state, loading, onNavigate, onNavigateUp, setLastItem, breadcrumbs, products }) {
  const safeProducts = Array.isArray(products) ? products : [];
  return (
    <div className="p-4">
      <nav className="mb-4">
        <Breadcrumbs stack={breadcrumbs} onNavigateUp={onNavigateUp} />
      </nav>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <aside className="md:col-span-1">
          <CatalogList catalogs={state.catalogs} loading={loading} onNavigate={onNavigate} setLastItem={setLastItem} />
        </aside>
        <main className="md:col-span-3">
          <ProductList products={safeProducts} />
        </main>
      </div>
    </div>
  );
}
