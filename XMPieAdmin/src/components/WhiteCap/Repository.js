const getBranches = async () =>{
    
  const branchList = []

  const fetchURL= import.meta.env.VITE_BASE_URL + 'GetWCBranches';

  console.log(fetchURL);

  let response = await fetch(`${import.meta.env.VITE_BASE_URL}GetWCBranches`, { method: 'GET', headers: { 'content-type': 'application/json' } });
  
  
  let jsonDoc = await response.json();
  
  jsonDoc.forEach((element) => { branchList.push(element)} )
  
  return branchList;

}


const insertBranch = async (branch, description, ranking) => {
  console.log("Insert: " , branch, description, ranking);

  let response = await fetch(`${import.meta.env.VITE_BASE_URL}InsertWCBranch?branch=${branch}&description=${description}&ranking=${ranking}`, { method: 'POST', headers: { 'content-type': 'application/json' } });

  let jsonDoc = await response.json();

  return jsonDoc;

}

const updateBranch = async ( branch, description, ranking) => {
  console.log("Update: " , branch, description, ranking);

  let response = await fetch(`${import.meta.env.VITE_BASE_URL}UpdateWCBranch?branch=${branch}&description=${description}&ranking=${ranking}`, { method: 'POST', headers: { 'content-type': 'application/json' } });

}

export {getBranches, insertBranch, updateBranch}