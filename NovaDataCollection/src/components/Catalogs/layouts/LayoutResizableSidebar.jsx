// LayoutResizableSidebar.jsx
import CatalogList from '../CatalogList';
import ProductList from '../../Products/ProductList';
import Breadcrumbs from '../Breadcrumbs';
import { Resizable } from 're-resizable';

export default function LayoutResizableSidebar({ state, loading, onNavigate, onNavigateUp, setLastItem, breadcrumbs, products }) {
  const safeProducts = Array.isArray(products) ? products : [];
  return (
    <div className="flex flex-col h-full">
      <nav className="p-4 border-b bg-gray-50">
        <Breadcrumbs stack={breadcrumbs} onNavigateUp={onNavigateUp} />
      </nav>
      <div className="flex flex-1 overflow-hidden">
        <Resizable
          defaultSize={{ width: 250, height: '100%' }}
          minWidth={200}
          maxWidth={400}
          enable={{ right: true }}
        >
          <aside className="h-full overflow-auto p-4 border-r bg-white">
            <CatalogList catalogs={state.catalogs} loading={loading} onNavigate={onNavigate} setLastItem={setLastItem} />
          </aside>
        </Resizable>
        <main className="flex-1 p-4 overflow-auto">
          <ProductList products={safeProducts} />
        </main>
      </div>
    </div>
  );
}
