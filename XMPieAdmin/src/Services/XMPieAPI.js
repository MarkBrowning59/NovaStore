import api from './api';

export const fetchOrderXML = (orders) => {
  
 console.log('📦 Fetch OrderXML:', orders);

return api
  .get('/GetOrdersXML', { params: { orders } })
  .then((res) => {
    return res.data; // <-- you must RETURN this
  })
  .catch((err) => {
    console.error('Error fetching order:', err);
    throw err; // rethrow if you want upstream code to handle it
  });

};



export const fetchEDJOrderID = (order) => {

return api
  .get('/GetEDJOrder', { params: { order } })
  .then((res) => {
    return res.data; // <-- you must RETURN this
  })
  .catch((err) => {
    console.error('Error fetching order:', err);
    throw err; // rethrow if you want upstream code to handle it
  });
};