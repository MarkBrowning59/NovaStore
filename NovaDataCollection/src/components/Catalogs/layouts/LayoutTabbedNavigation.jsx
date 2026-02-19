// LayoutTabbedNavigation.jsx
import TabbedCatalogs from './TabbedCatalogs';
import ProductList from '../../Products/ProductList';
import Breadcrumbs from '../Breadcrumbs';

export default function LayoutTabbedNavigation({ breadcrumbs, products, onNavigateUp }) {
  const safeProducts = Array.isArray(products) ? products : [];
  return (
    <div className="p-4 space-y-4">
      <Breadcrumbs stack={breadcrumbs} onNavigateUp={onNavigateUp} />
      <TabbedCatalogs />
      <main>
        <ProductList products={safeProducts} />
      </main>
    </div>
  );
}
