
import React from 'react';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

const CategoryPage = ({ params }: CategoryPageProps) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Category: {params.category}</h1>
      <p>This is the placeholder for the category page.</p>
    </div>
  );
};

export default CategoryPage;
