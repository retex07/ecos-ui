import React from 'react';
import PropTypes from 'prop-types';

const FolderImage = ({ className }) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 22" fill="none">
      <path
        d="m0 3c0-1.7 1.3-3 3-3h6.5c1.2 0 2.3 0.7 2.7 1.8l0.2 0.4c0.5 1.1 1.6 1.8 2.7 1.8h10.9c1.7 0 3 1.3 3 3v12c0 1.7-1.3 3-3 3h-23c-1.7 0-3-1.3-3-3v-16z"
        fill="#C6D6F0"
      />
    </svg>
  );
};

FolderImage.propTypes = {
  className: PropTypes.string
};

export default FolderImage;
