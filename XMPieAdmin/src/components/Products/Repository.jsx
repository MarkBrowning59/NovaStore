const getStores = async () =>{
    
  let response = await fetch(`http://localhost:51044/GetStores`, { method: 'GET', headers: { 'content-type': 'application/json' } });

  // let response = await fetch(`https://apiustore.novabpc.com:8443/GetStores`, { method: 'GET', headers: { 'content-type': 'application/json' } });
  
  let stores = await response.json();
  
  
  return stores;

}
const getProductGroups = async (storeID, ParentGroupID =0, ProductGroupType = 1) =>{
    
  let response = await fetch( `http://localhost:51044/GetProductGroups?storeID=${storeID}&ParentGroupID=${ParentGroupID}&ProductGroupType=${ProductGroupType}`, { method: 'GET', headers: { 'content-type': 'application/json' } });
  // let response = await fetch( `https://apiustore.novabpc.com:8443/GetProductGroups?storeID=${storeID}&ParentGroupID=${ParentGroupID}&ProductGroupType=${ProductGroupType}`, { method: 'GET', headers: { 'content-type': 'application/json' } });

  
  let productGroups = await response.json();
  
  
  return productGroups;

}




export {getStores, getProductGroups}