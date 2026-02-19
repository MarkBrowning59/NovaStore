const getPorscheInventoryFromBC = async () =>{
    
  const porscheInventoryList = []

  const fetchURL= import.meta.env.VITE_BASE_URL + 'GetPorscheInventoryFromBC';

  console.log(fetchURL);

  let response = await fetch(`${import.meta.env.VITE_BASE_URL}GetPorscheInventoryFromBC`, { method: 'GET', headers: { 'content-type': 'application/json' } });
  
  
  let jsonDoc = await response.json();
  
  jsonDoc.forEach((element) => { 
    
    let item =
        porscheInventoryList.push(element)} 
    )
  
  return porscheInventoryList;

}

export {getPorscheInventoryFromBC}