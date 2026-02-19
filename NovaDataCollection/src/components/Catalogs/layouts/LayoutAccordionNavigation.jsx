// LayoutAccordionNavigation.jsx
import AccordionCatalogs from './AccordionCatalogs';
import Breadcrumbs from '../Breadcrumbs';

export default function LayoutAccordionNavigation({ breadcrumbs, products, onNavigateUp }) {
  const safeProducts = Array.isArray(products) ? products : [];
  return (
    <div className="p-4 space-y-4">
      <Breadcrumbs stack={breadcrumbs} onNavigateUp={onNavigateUp} />
      <AccordionCatalogs products={safeProducts} />
    </div>
  );
}
