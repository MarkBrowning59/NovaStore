import React, { useState, useEffect } from 'react';
import {getPorscheInventoryFromBC} from './Repository'
import './PorscheInventory.css'

const PorscheInventory = () => {
  
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [inventory, setInventory] = useState ([]);

  useEffect( () => {
    initInventory()
  },[]);

  const initInventory = async () =>{
   

    let inventory = await getPorscheInventoryFromBC();

let pInventory = inventory.map((item) => {
            return  {
              No: item.No
              ,Description: item.Description
              ,OnHandInventory: item.Inventory
              ,QTYOnOutstandingOrder:  item.Qty_on_Sales_Order + item.Qty_on_Asm_Component
              ,AvailableInventory: item.Inventory - (item.Qty_on_Sales_Order + item.Qty_on_Asm_Component)
            }

      })

    setInventory(pInventory);

    setIsLoading(false);

    console.log(pInventory);
  }

  return (

    <section id='mainSection'>
  
    <article id="mainSectionArticle">

{(isLoading && <div id='loadingContainer'><div className='loader'></div></div>) ||

    <div id='branches'>
      <table >
       <thead>
            <tr>
              <th>No</th>
              <th>Description</th>
              <th>On Hand Inventory</th>
              <th>QTY On Outstanding Order</th>
              <th>Available Inventory</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item)=>{return <tr key={item.No}>
            <td>{item.No}</td>
            <td>{item.Description}</td>
            <td>{item.OnHandInventory}</td>
            <td>{item.QTYOnOutstandingOrder}</td>
            <td>{item.AvailableInventory}</td>
            </tr>})
          }
          </tbody>
        </table> 

      </div>
}
    </article>


</section>
  )
}

export default PorscheInventory