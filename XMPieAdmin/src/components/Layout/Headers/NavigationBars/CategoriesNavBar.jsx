import React from 'react'
import { Link } from 'react-router-dom';


import './CategoriesNavBar.css'


const CategoriesNavBar = () => {

return (
      <nav id='categoriesNavBar'> 
         <Link to="/WCBranches">WC Branches</Link>
         <Link to="/OrderXML">Order XML</Link>
         <Link to="/Coupons">Coupons</Link>
         <Link to="/EDJOrderID">EDJ OrderID</Link>
      
      </nav> 
  )
  }

export default CategoriesNavBar