import React from 'react';
import { Package, DollarSign, AlertTriangle, Tag } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { formatCurrency } from '../../utils/helpers';
import Card from '../UI/Card';

const InventorySummaryCards: React.FC = () => {
  const { inventorySummary } = useProducts();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="border-l-4 border-blue-500">
        <div className="flex items-center">
          <div className="mr-4 bg-blue-100 p-3 rounded-full dark:bg-blue-900">
            <Package className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Products
            </h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {inventorySummary.totalProducts}
            </p>
          </div>
        </div>
      </Card>
      
      <Card className="border-l-4 border-green-500">
        <div className="flex items-center">
          <div className="mr-4 bg-green-100 p-3 rounded-full dark:bg-green-900">
            <DollarSign className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Value
            </h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(inventorySummary.totalValue)}
            </p>
          </div>
        </div>
      </Card>
      
      <Card className={`border-l-4 ${inventorySummary.lowStockCount > 0 ? 'border-orange-500' : 'border-gray-300'}`}>
        <div className="flex items-center">
          <div className={`mr-4 p-3 rounded-full ${
            inventorySummary.lowStockCount > 0 
              ? 'bg-orange-100 dark:bg-orange-900' 
              : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <AlertTriangle className={`h-6 w-6 ${
              inventorySummary.lowStockCount > 0 
                ? 'text-orange-500' 
                : 'text-gray-500'
            }`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Low Stock
            </h3>
            <p className={`text-2xl font-bold ${
              inventorySummary.lowStockCount > 0 
                ? 'text-orange-600 dark:text-orange-400' 
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {inventorySummary.lowStockCount}
            </p>
          </div>
        </div>
      </Card>
      
      <Card className="border-l-4 border-purple-500">
        <div className="flex items-center">
          <div className="mr-4 bg-purple-100 p-3 rounded-full dark:bg-purple-900">
            <Tag className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Categories
            </h3>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {inventorySummary.categories}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InventorySummaryCards;