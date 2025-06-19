import React from 'react';
import InventorySummaryCards from './InventorySummaryCards';
import ProductList from './ProductList';

const Inventory: React.FC = () => {
  return (
    <div className="space-y-6">
      <InventorySummaryCards />
      <ProductList />
    </div>
  );
};

export default Inventory;