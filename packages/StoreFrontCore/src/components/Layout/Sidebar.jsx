import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function Sidebar({ links = [], className = '', isVisible = true }) {



  return (
    <aside
  className={`
    bg-teal-100 p-4 border-r
    transition-transform duration-300 ease-in-out
    fixed top-16 left-0 h-full w-64 z-40
    ${isVisible ? 'translate-x-0' : '-translate-x-full'}
    md:hidden
    ${className}
  `}
    >
      <nav className="space-y-2">
        {links.map(({ href, label }) => (
          <Link key={href} to={href} className="block text-teal-900 hover:underline">
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

Sidebar.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      href: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  className: PropTypes.string,
  isVisible: PropTypes.bool,
};
