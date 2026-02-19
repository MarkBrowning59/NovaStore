import './App.css';
import './NovaAdmin.css'
//Routing
import { BrowserRouter as Router, Routes, Route, createBrowserRouter } from "react-router-dom";

// import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import {Home, WCBranches, OrderXML, Products} from "./routes"

// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <Route path="/" element={<Home />}>
//       <Route index element={<Home />} />
//       <Route exact path="/WCBranches" element={<WCBranches />} />
//       <Route exact path="/OrderXML" element={<OrderXML />} />
//       <Route exact path="/Products" element={<Products />} />
//     </Route>
//   )
// )

function App() {

  return (

    // <>
    //   <RouterProvider router={router}/>
    // </>
    <>
 
    <Router>
    <Routes>
        <Route index element={<Home />} />
        <Route exact path="/WCBranches" element={<WCBranches />} />
        <Route exact path="/OrderXML" element={<OrderXML />} />
        <Route exact path="/Products" element={<Products />} />
        <Route path="/" element={<Home />} />
    </Routes>
  </Router>
   </>

  );
  }
export default App;
