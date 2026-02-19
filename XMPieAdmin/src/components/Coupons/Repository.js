const updateCouponAmount = async ( couponCode, couponAmount) => {

  let response = await fetch(`${import.meta.env.VITE_BASE_URL}UpdateCouponAmount?couponCode=${couponCode}&couponAmount=${couponAmount}`, { method: 'POST', headers: { 'content-type': 'application/json' } }); 

}

export {updateCouponAmount}