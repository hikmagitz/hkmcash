import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, ProductCategory, InventorySummary } from '../types';
import { generateId } from '../utils/helpers';

interface ProductContextType {
  products: Product[];
  productCategories: ProductCategory[];
  inventorySummary: InventorySummary;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addProductCategory: (category: Omit<ProductCategory, 'id'>) => void;
  deleteProductCategory: (id: string) => void;
  isLoading: boolean;
}

const ProductContext = createContext<ProductContextType | null>(null);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

const getDefaultProductCategories = (): ProductCategory[] => [
  { id: generateId(), name: 'Electronics', color: '#3B82F6' },
  { id: generateId(), name: 'Clothing', color: '#10B981' },
  { id: generateId(), name: 'Food & Beverages', color: '#F59E0B' },
  { id: generateId(), name: 'Books', color: '#8B5CF6' },
  { id: generateId(), name: 'Home & Garden', color: '#EF4444' },
  { id: generateId(), name: 'Sports', color: '#14B8A6' },
  { id: generateId(), name: 'Other', color: '#6B7280' },
];

const calculateInventorySummary = (products: Product[], categories: ProductCategory[]): InventorySummary => {
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const lowStockCount = products.filter(product => product.quantity <= 5).length;
  
  return {
    totalProducts,
    totalValue,
    lowStockCount,
    categories: categories.length,
  };
};

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary>({
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0,
    categories: 0,
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedProducts = localStorage.getItem('products');
        const savedCategories = localStorage.getItem('productCategories');
        
        if (savedProducts) {
          setProducts(JSON.parse(savedProducts));
        }
        
        if (savedCategories) {
          setProductCategories(JSON.parse(savedCategories));
        } else {
          const defaultCategories = getDefaultProductCategories();
          setProductCategories(defaultCategories);
          localStorage.setItem('productCategories', JSON.stringify(defaultCategories));
        }
      } catch (error) {
        console.error('Error loading product data:', error);
        const defaultCategories = getDefaultProductCategories();
        setProductCategories(defaultCategories);
        localStorage.setItem('productCategories', JSON.stringify(defaultCategories));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Update inventory summary when products or categories change
  useEffect(() => {
    setInventorySummary(calculateInventorySummary(products, productCategories));
  }, [products, productCategories]);

  // Save products to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('products', JSON.stringify(products));
    }
  }, [products, isLoading]);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('productCategories', JSON.stringify(productCategories));
    }
  }, [productCategories, isLoading]);

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === updatedProduct.id
          ? { ...updatedProduct, updatedAt: new Date().toISOString() }
          : product
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const addProductCategory = (categoryData: Omit<ProductCategory, 'id'>) => {
    const newCategory: ProductCategory = {
      ...categoryData,
      id: generateId(),
    };
    
    setProductCategories(prev => [...prev, newCategory]);
  };

  const deleteProductCategory = (id: string) => {
    setProductCategories(prev => prev.filter(category => category.id !== id));
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        productCategories,
        inventorySummary,
        addProduct,
        updateProduct,
        deleteProduct,
        addProductCategory,
        deleteProductCategory,
        isLoading,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};