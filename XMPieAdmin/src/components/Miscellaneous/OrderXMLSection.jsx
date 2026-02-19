import {useState , React} from 'react'
import {fetchOrderXML} from '../../Services/XMPieAPI'
import  './OrderXMLSection.css'

const OrderXMLSection = () => {

  const [currentFileState, setCurrentFileState] = useState (false);

const getXML = async ()=>{

  const orders = document.getElementById('ordersID');
 
   let response = await fetchOrderXML(orders.value);
  
console.log(response);

  setCurrentFileState(true);

}
  return (
    <div id='OrderXMLSection'>
      <div id='OrderXMLContainer' >
        <label htmlFor="ordersID">Order ID(s)</label>
      <input id="ordersID" type="text" placeholder='Enter Comma Separated Order IDs' onChange={()=>{setCurrentFileState(false)}} />
      <button onClick={getXML}>Generate XML</button>
     { currentFileState && <div>Generated files can be found on uPro at ( C:\OrdersXML )</div>}

      </div>
    </div>
  )
}

export default OrderXMLSection