import React, { useState, useMemo } from 'react';
import { Edit, Trash2, Package, Search, Filter, ChevronDown, X } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Product } from '../../types';
import Button from '../UI/Button';
import Card from '../UI/Card';
import ProductModal from './ProductModal';

const ProductList: React.FC = () => {
  const { products, deleteProduct, productCategories } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    searchTerm: '',
    categories: [] as string[],
    lowStock: false,
  });

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(searchLower);
        const matchesCategory = product.category.toLowerCase().includes(searchLower);
        const matchesDescription = product.description?.toLowerCase().includes(searchLower);
        
        if (!matchesName && !matchesCategory && !matchesDescription) {
          return false;
        }
      }
      
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
        return false;
      }
      
      // Low stock filter
      if (filters.lowStock && product.quantity > 5) {
        return false;
      }
      
      return true;
    });
  }, [products, filters]);

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setCurrentProduct(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProduct(id);
    }
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      categories: [],
      lowStock: false,
    });
  };

  const hasActiveFilters = filters.searchTerm || filters.categories.length > 0 || filters.lowStock;
  const activeFilterCount = [
    filters.searchTerm ? 1 : 0,
    filters.categories.length,
    filters.lowStock ? 1 : 0
  ].reduce((sum, count) => sum + count, 0);

  const getCategoryColor = (categoryName: string) => {
    const category = productCategories.find((cat) => cat.name === categoryName);
    return category?.color || '#6B7280';
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Product Inventory ({filteredProducts.length})
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[44px]"
            />
            <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          {/* Filter Button */}
          <div className="relative">
            <Button 
              type="secondary" 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full sm:w-auto relative"
            >
              <Filter size={18} />
              Filter
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </Button>
            
            {/* Filter Panel */}
            {isFilterOpen && (
              <Card className="absolute right-0 mt-2 w-80 z-20 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Filters</h3>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Low Stock Filter */}
                  <div>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={filters.lowStock}
                        onChange={(e) => setFilters(prev => ({ ...prev, lowStock: e.target.checked }))}
                        className="mr-2 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Low Stock (≤5 items)
                      </span>
                    </label>
                  </div>
                  
                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categories
                    </label>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {productCategories.map((category) => (
                        <label key={category.id} className="flex items-center">
                          <input 
                            type="checkbox" 
                            checked={filters.categories.includes(category.name)}
                            onChange={(e) => handleCategoryChange(category.name, e.target.checked)}
                            className="mr-2 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {category.name}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Button 
                      type="secondary" 
                      onClick={clearFilters}
                      className="flex-1"
                      disabled={!hasActiveFilters}
                    >
                      Clear All
                    </Button>
                    <Button 
                      type="primary" 
                      onClick={() => setIsFilterOpen(false)}
                      className="flex-1"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
          
          <Button type="primary" onClick={handleAdd}>
            <Package size={18} />
            Add Product
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.searchTerm && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
              Search: "{filters.searchTerm}"
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
                className="ml-2 text-teal-600 hover:text-teal-800 dark:text-teal-300"
              >
                <X size={14} />
              </button>
            </span>
          )}
          {filters.lowStock && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              Low Stock
              <button
                onClick={() => setFilters(prev => ({ ...prev, lowStock: false }))}
                className="ml-2 text-orange-600 hover:text-orange-800 dark:text-orange-300"
              >
                <X size={14} />
              </button>
            </span>
          )}
          {filters.categories.map(category => (
            <span key={category} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              {category}
              <button
                onClick={() => handleCategoryChange(category, false)}
                className="ml-2 text-purple-600 hover:text-purple-800 dark:text-purple-300"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Results Summary */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredProducts.length} of {products.length} products
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-2 text-teal-600 hover:text-teal-800 dark:text-teal-400 underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {hasActiveFilters ? 'No products match your filters' : 'No products yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {hasActiveFilters 
              ? 'Try adjusting your search criteria or filters'
              : 'Start building your inventory by adding your first product'
            }
          </p>
          {!hasActiveFilters && (
            <Button type="primary" onClick={handleAdd}>
              <Package size={18} />
              Add Your First Product
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id}
              className={`hover:shadow-lg transition-shadow duration-200 ${
                product.quantity <= 5 ? 'border-l-4 border-orange-500' : ''
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {product.name}
                    </h3>
                    <div 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1"
                      style={{ 
                        backgroundColor: `${getCategoryColor(product.category)}20`,
                        color: getCategoryColor(product.category)
                      }}
                    >
                      {product.category}
                    </div>
                  </div>
                  {product.quantity <= 5 && (
                    <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-orange-900 dark:text-orange-200">
                      Low Stock
                    </span>
                  )}
                </div>

                {product.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {product.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {product.quantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Value</span>
                    <span className="font-semibold text-lg text-teal-600 dark:text-teal-400">
                      {formatCurrency(product.price * product.quantity)}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      type="secondary" 
                      onClick={() => handleEdit(product)}
                      className="flex-1"
                    >
                      <Edit size={16} />
                      Edit
                    </Button>
                    <Button 
                      type="danger" 
                      onClick={() => handleDelete(product.id, product.name)}
                      className="flex-1"
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-gray-400 dark:text-gray-500">
                  Updated: {formatDate(product.updatedAt)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        product={currentProduct}
        mode={modalMode}
      />
    </div>
  );
};

export default ProductList;