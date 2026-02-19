// services/catalogApi.js
import api from './api';

export const fetchRequest = ( storeNumber = null) => {
  
 console.log('📦 Fetch Request:', parentId);

  return api.get('/catalogs', {
    params: { page, pageSize, parentId },
  }).then(res => res.data);
};

export const updateCatalog = (id, data) => {

 console.log('📦 Incoming PATCH for catalog:', id, data);


  return api.patch(`/catalogs`, data);
};

export const addCatalog = (catalog) => {
   console.log('📦 Add Catalog:', catalog);
  return api.post('/catalogs', catalog).then(    
    res => res.data  
  );
};


export const fetchCatalogById = (id) => {
  return api.get(`/catalogs/${id}`).then(res => res.data);
};

export const bulkUpdateCatalogs = (ids, StatusID) => {
  return api.patch(`/catalogs/bulk`, { ids, StatusID });
};