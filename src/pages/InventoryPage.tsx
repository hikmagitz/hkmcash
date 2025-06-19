import React from 'react';
import Inventory from '../components/Inventory';

const InventoryPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Product Inventory
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your product inventory, track stock levels, and monitor total value
        </p>
      </div>
      <Inventory />
    </div>
  );
};

export default InventoryPage;