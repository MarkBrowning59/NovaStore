import React, { useState, useEffect } from 'react';
import './Stores.css'
import {getStores, getProductGroups} from './Repository'

const Stores = () => {

  const [stores, setStores] = useState({storeList:[], currentStore: ''});

  const [productGroups, setProductGroups] = useState([]);

  useEffect( () => {
     initStores()
    },[]);

  const initStores = async () =>{
   let storeList = await getStores();

    setStores({storeList:storeList.Stores, currentStore:storeList.Stores[0].StoreID});

    initProductGroups(storeList.Stores[0].StoreID);

  }

  const initProductGroups = async (StoreID) =>{
   let storeList = await getStores();

   let {ProductGroups} = await getProductGroups(StoreID);

   
    setProductGroups((currentState)=>{
      
      console.log(currentState);     
            
      return  ProductGroups;
    });
    
  


  }




  const getGroups = async (StoreID, ParentGroupID =0, ProductGroupType = 1) =>{
  
   let groups = await getProductGroups(StoreID, ParentGroupID ,ProductGroupType);

   console.log(groups.ProductGroups)
//   setProductGroups(groups.ProductGroups);
  }

  return (
    <div id='storeListContainer'>
      <label htmlFor='storeList'>Stores</label>
      <select name="storeList" id="storeList" onChange={(e)=> {initProductGroups(e.target.value)}} defaultValue={stores.currentStore}>
        { stores.storeList.map( (store)=>{ return <option value={store.StoreID} key={store.StoreID} >{store.Name}</option> })}
      </select>
    </div>   
  )
}

export default Stores