import React from 'react';

const SearchBar: React.FC = () => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search for devices..."
        className="px-4 py-2 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
      />
      {/* Autocomplete dropdown and suggestions will go here */}
    </div>
  );
};

export default SearchBar;
