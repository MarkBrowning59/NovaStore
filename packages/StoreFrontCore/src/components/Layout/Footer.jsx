import { Link } from 'react-router-dom';


export default function Footer({ links = [], className = '' }) {


  return (
    <footer className={`flex flex-col justify-between items-center ${className}`}>
          
          <div>Need Assistance?</div>

           {links.map(({ href, label }) => (
                <Link key={href} to={href} className="text-white hover:underline">
                  {label}
                </Link>
      ))}

    </footer >
  );
}
