import CatalogsPageBase from '../components/Catalogs/CatalogsPageBase';
import {
  LayoutSidebarWithGrid
} from '../components/Catalogs/CatalogLayouts';

export default function CatalogsSidebarPage() {
  return (
    <CatalogsPageBase
      renderLayout={(props) => <LayoutSidebarWithGrid {...props} />}
    />
  );
}
