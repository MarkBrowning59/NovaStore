import {useRef  , React} from 'react'
import  './UpdateCoupons.css'
import {updateCouponAmount} from './Repository'

const UpdateCoupons = () => {

  const couponCode = useRef('');
  const couponAmount = useRef(0);

  const updateCoupon =  () =>
  {  
    updateCouponAmount(couponCode.current.value, couponAmount.current.value)
    
  }


  return (

    <div id='CouponSection'>
    <div id='UpdateCouponContainer' >
    <label htmlFor="couponCode">Coupon Code</label>
    <input id="couponCode" type="text" placeholder='Enter Coupon Code' ref={couponCode}/>
    <label htmlFor="couponAmount">Coupon Amount</label>
    <input id="couponAmount" type="text" placeholder='Enter Coupon Amount' ref={couponAmount}/>
    
    <button onClick={updateCoupon}>Update Coupon</button>
    </div>
  </div>
  )
}

export default UpdateCoupons