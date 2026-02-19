
import { Link } from 'react-router-dom';

export default function NavBar({ links = [], className = '' }) {
  
  return (
    

<nav className={`flex flex-col justify-between items-center  md:flex md:flex-row ${className}`}>

      {links.map(({ href, label }) => (
        <Link key={href} to={href} className="text-white hover:underline">
          {label}
        </Link>
      ))}


</nav>
      
      

  );
}
