import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function Logo({ src, brand }) {
  return (
    <Link to="/" className="flex items-center space-x-2 group">
      {src && (
        <img
          src={src}
          alt={`${brand} Logo`}
          className="h-8 w-auto transition-transform group-hover:scale-105"
        />
      )}
{brand && brand.trim() !== '' && (
  <span className="text-xl">{brand} </span>
)}
    </Link>
  );
}

Logo.propTypes = {
  src: PropTypes.string,
  brand: PropTypes.string.isRequired,
};
