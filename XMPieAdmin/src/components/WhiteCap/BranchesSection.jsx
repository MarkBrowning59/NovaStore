import React, { useState, useEffect } from 'react';
import './BranchesSection.css'
import Branch from './Branch';
import {getBranches} from './Repository'

const Branches = () => {

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [branches, setBranches] = useState([]);

  useEffect( () => {
    initBranches()
  },[]);

  const initBranches = async () =>{
   
    let branches = await getBranches();
    setBranches(branches);
    setIsLoading(false);
  }



  return (

    <section id='mainSection'>
    
        <aside id="mainSectionAside">
        <Branch branches={branches}  initBranches={initBranches}/>    
        </aside>

        <article id="mainSectionArticle">

{(isLoading && <div id='loadingContainer'><div className='loader'></div></div>) ||

        <div id='branches'>
          <table >
           <thead>
                <tr>
                  <th>Branch</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch)=>{return <tr key={branch.Branch}>
                <td>{branch.Branch}</td>
                <td>{branch.Description}</td>
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

export default Branches