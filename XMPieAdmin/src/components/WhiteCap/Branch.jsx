import {useState , React} from 'react'
import './BranchesSection.css'
import {insertBranch, updateBranch} from './Repository'

const Branch = ({ branches, initBranches}) => {

 const [currentBranch, setCurrentBranch] = useState ({Branch:'', Description:'', Ranking:2, new:true});

 const handleFormBranchInput = async (branch) =>{

  if(branch.id === 'branch')  
   {
    
       const found = await branches.find((element) => element.Branch.trim().toUpperCase() === branch.value.trim().toUpperCase());


       
if(found != undefined)
            setCurrentBranch({...found, new:false})
        else
            setCurrentBranch({ Branch:branch.value, Description:"", Ranking:2, new:true});
  }

    if(branch.id === 'description')
    setCurrentBranch({...currentBranch, Description:branch.value})
    
    if(branch.id === 'ranking')
    setCurrentBranch({...currentBranch, Ranking:branch.value})

  }

 const handleFormSubmission = async (e) =>{
   e.preventDefault();
   
   const {Branch, Description, Ranking} =   currentBranch;
   console.log(Branch, Description, Ranking); 

  if(currentBranch.new)
  {
    console.log( await insertBranch(Branch, Description, Ranking));
    setCurrentBranch({...currentBranch, new:false});
  }
  else
    await updateBranch(Branch, Description, Ranking);

    await initBranches();
 }

  return (
    <div id='branchContainer'>
      
      <form onSubmit={handleFormSubmission}>  

        <h3 id='newBranchHeader'>Manage Branch</h3>

        <label htmlFor="branch">Branch Number</label>
        <input className='branchInput' type="text" name="branch" id='branch' placeholder='Enter Branch Number'onChange={(e) => {handleFormBranchInput(e.target)}}/>

        <label htmlFor="description">Branch Description</label>
        <input className='branchInput'  type="text" name="description" id="description" placeholder='Enter Description' value={currentBranch.Description} onChange={(e) => {handleFormBranchInput(e.target)}}/>


        
        <label htmlFor="ranking">Sort Ranking</label>
          <select id="ranking" name="ranking" value={currentBranch.Ranking} onChange={(e)=> {handleFormBranchInput(e.target)}}>
            <option value="0">NOVA Users</option>
            <option value="2" >White Cap</option>
            <option value="3">Operations</option>
            <option value="4">Diamond Tool</option>
            <option value="6">Best Materials</option>
            <option value="7">Masonpro Inc</option>
            <option value="8">All-Tex Supply</option>
            <option value="9">Border Con</option>
            <option value="10">Brafasco</option>
            <option value="11">Brock White</option>
            <option value="12">BWC</option>
            <option value="13">Carter Waters</option>
            <option value="14">Construct Mat</option>
            <option value="15">CSG</option>
            <option value="16">NCA</option>
            <option value="18">Stetson</option>
          </select>
        
          {(currentBranch.Branch !== '') && <button type='submit'  id='submit'>{((currentBranch.new ) && "Add Branch") || "Edit Branch"}</button>}
      
      </form>
    </div>
  )

}

export default Branch