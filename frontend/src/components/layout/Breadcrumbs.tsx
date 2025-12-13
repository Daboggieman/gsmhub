
import React from 'react';

const Breadcrumbs = () => {
  return (
    <nav className="text-sm text-gray-500">
      <ol className="list-none p-0 inline-flex">
        <li className="flex items-center">
          <a href="#" className="text-blue-600 hover:underline">Home</a>
          <span className="mx-2">/</span>
        </li>
        <li className="flex items-center">
          <a href="#" className="text-blue-600 hover:underline">Category</a>
          <span className="mx-2">/</span>
        </li>
        <li className="flex items-center">
          <span>Current Page</span>
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
