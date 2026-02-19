import CatalogsPageBase from './CatalogsPageBase';
import {
  LayoutSidebarWithGrid
} from './CatalogLayouts';

export default function CatalogsSidebarPage() {
  return (
    <CatalogsPageBase
      renderLayout={(props) => <LayoutSidebarWithGrid {...props} />}
    />
  );
}
