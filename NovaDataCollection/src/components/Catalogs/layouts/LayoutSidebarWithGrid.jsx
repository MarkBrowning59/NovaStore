
// LayoutSidebarWithGrid.jsx (forwards onEditCatalog)
import CatalogList from '../CatalogList';
import ProductList from '../../Products/ProductList';
import Breadcrumbs from '../Breadcrumbs';
import CatalogFormModal from '../CatalogFormModal';

export default function LayoutSidebarWithGrid({
  state, loading, onNavigate, onNavigateUp, setLastItem,
  breadcrumbs, products, onAddCatalog, onEditCatalog, isModalOpen, onCloseModal,
  onSaveCatalog, currentParentName, editingCatalog
}) {
  return (
    <div className="flex flex-col h-full">
      <CatalogFormModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        onSave={onSaveCatalog}
        parentCatalogName={currentParentName}
        initialCatalog={editingCatalog}
      />

      <nav className="p-4 border-b bg-gray-50">
        <Breadcrumbs stack={breadcrumbs} onNavigateUp={onNavigateUp} />
      </nav>

      <div className="flex flex-1">
        <aside className="w-64 p-4 border-r bg-white overflow-auto">
          <CatalogList
            catalogs={state.catalogs}
            loading={loading}
            onNavigate={onNavigate}
            setLastItem={setLastItem}
            onAddCatalog={onAddCatalog}
            onEditCatalog={onEditCatalog}
          />
        </aside>

        <main className="flex-1 p-4 overflow-auto">
          <ProductList products={Array.isArray(products) ? products : []} />
        </main>
      </div>
    </div>
  );
}
