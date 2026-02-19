import {useState , React} from 'react'
import {fetchEDJOrderID} from '../../Services/XMPieAPI'
import  './EDJOrderID.css'

const EDJOrderIDSection = () => {

  const [uStoreID, setCurrentUStoreID] = useState (null);

const getOrderID = async () => {
  const orderInput = document.getElementById('orderID');
  if (!orderInput) {
    console.error("Element with id 'orderID' not found");
    return;
  }

  const orderID = orderInput.value.trim();
  if (!orderID) {
    console.error("Order ID is required");
    return;
  }

  try {
    const response = await fetchEDJOrderID(orderID);
    console.log("Fetched Order:", response);
    setCurrentUStoreID(response);
  } catch (error) {
    console.error("Error fetching order:", error);
  }
};

  return (
    <div id='EDJOrderIDSection'>
      <div id='EDJOrderIDContainer' >
        <label htmlFor="orderID">ED Order ID</label>
      <input id="orderID" type="text" placeholder='EDJ Order ID'/>
      <button onClick={getOrderID}>Get uStore OrderID</button>

     <div>uStore Order ID: {uStoreID} </div>

      </div>
    </div>
  )
}

export default EDJOrderIDSection