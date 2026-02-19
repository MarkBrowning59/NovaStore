import React from 'react';
import CatalogsPageBase from '../components/Catalogs/CatalogsPageBase';
import {
  LayoutSidebarWithGrid
} from '../components/Catalogs/CatalogLayouts';

export default function Home() {
  return (
    <section className="home">
          <CatalogsPageBase
            renderLayout={(props) => <LayoutSidebarWithGrid {...props} />}
          />
    </section>
  );
}