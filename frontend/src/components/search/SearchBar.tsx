import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const SearchBar: React.FC = () => {
  return (
    <div className="relative flex items-center w-64">
      <input
        type="text"
        placeholder="Search for devices..."
        className="w-full px-4 py-2 rounded-l-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-r-full bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <FontAwesomeIcon icon={faSearch} className="h-5 w-5 text-white" />
      </button>
    </div>
  );
};

export default SearchBar;
