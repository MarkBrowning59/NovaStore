// import { Link } from 'react-router-dom';
// import { useCatalog } from '../../hooks/useCatalog';

// export default function CatalogList({ catalogs, loading, onNavigate, setLastItem }) {
//   const { prefetchCatalogProducts } = useCatalog();


//   console.log('Catalogs received in CatalogList:', catalogs);
  
//   if (!Array.isArray(catalogs)) {
//     console.warn('CatalogList expected an array but got:', catalogs);
//     return <div>No catalogs available.</div>;
//   }


//   return (
//     <div>
//       {catalogs.map((catalog, index) => {
//         const isLast = index === catalogs.length - 1;
//         return (
//           <div key={catalog._id} ref={isLast ? setLastItem : null}>
//             <span
//               style={{ cursor: 'pointer', textDecoration: 'underline' }}
//               onClick={() => {
//                 if (!catalog.children || catalog.children.length === 0) return;
//                 onNavigate(catalog._id, catalog.name);
//               }}
//               onMouseEnter={() => {
//                 if (!catalog.products || catalog.products.length === 0) return;
//                 prefetchCatalogProducts(catalog._id, catalog.products);
//               }}
//             >
//               {catalog.name}
//             </span>
//           </div>
//         );
//       })}
//       {loading && <div>Loading more...</div>}
//     </div>
//   );
// }


import { useState } from 'react';
import { useCatalog } from '../../hooks/useCatalog';
import CatalogCard from './CatalogCard';

export default function CatalogList({ catalogs, loading, onNavigate, setLastItem, onAddCatalog, onEditCatalog }) {
  const { prefetchCatalogProducts } = useCatalog();
  const [showArchived, setShowArchived] = useState(false);

  const filteredCatalogs = catalogs.filter(c => showArchived || c.StatusID !== 3);

  const getStatusBadge = (statusId) => {

    if (statusId === 1) return "border-green-950 ";
    if (statusId === 0) return "border-yellow-500 ";
    if (statusId === 3) return "border-red-600 ";


    return null;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 border  border-gray-200 rounded-lg hover:shadow-md transition-shadow flex flex-col gap-4 justify-between items-center">
       
        <button className=" bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800" onClick={onAddCatalog}>Add Catalog</button>
        <button className="text-sm px-2 py-1 rounded border hover:bg-gray-100" onClick={() => setShowArchived(!showArchived)}>
          {showArchived ? 'Hide Archived' : 'Show Archived'}
        </button>
      </div>

      {[...filteredCatalogs]
        .sort((a, b) => (a.DisplayOrder || 0) - (b.DisplayOrder || 0))
        .map((catalog, index) => {
          const isLast = index === filteredCatalogs.length - 1;
  
          return (
            <div
              key={catalog._id}
              ref={isLast ? setLastItem : null}
              className={getStatusBadge(catalog.StatusID) + "rounded-lg p-4 border hover:shadow-md transition-shadow flex justify-between items-center gap-2"}                           
            >
                                       
                <span
                  className="text-blue-700 underline hover:text-blue-900 cursor-pointer"
                  
                  //onClick={() => prefetchCatalogProducts(catalog._id, catalog.products)}
                   onClick={() => onNavigate(catalog._id, catalog.name)}
                  
                  onMouseEnter={() => {
                    if (!catalog.products || catalog.products.length === 0) return;
                     console.log('Triggering prefetch for', catalog._id);
                    prefetchCatalogProducts(catalog._id, catalog.products);
                  }}

                >
                {catalog.name}
                </span>   
  

             <button
                className="ml-4 px-2 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                onClick={() => onEditCatalog(catalog)}
              >
                Edit
              </button>      

            </div>
          );
        })}

      {loading && <div className="text-center text-sm text-gray-600">Loading more...</div>}
    </div>
  );
}
