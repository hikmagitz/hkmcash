import React, { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useTransactions } from '../../context/TransactionContext';
import { calculateCategoryTotals, formatCurrency } from '../../utils/helpers';
import Card from '../UI/Card';

interface CategoryChartProps {
  type: 'income' | 'expense';
}

const CategoryChart: React.FC<CategoryChartProps> = ({ type }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { transactions, categories } = useTransactions();
  const intl = useIntl();

  const filteredTransactions = transactions.filter(
    (transaction) => transaction.type === type
  );

  const categoryTotals = calculateCategoryTotals(filteredTransactions);
  const totalAmount = categoryTotals.reduce((sum, item) => sum + item.total, 0);

  useEffect(() => {
    if (chartRef.current && categoryTotals.length > 0) {
      const bars = chartRef.current.querySelectorAll('.category-bar');
      bars.forEach((bar, index) => {
        setTimeout(() => {
          (bar as HTMLElement).style.width = `${(categoryTotals[index].total / totalAmount) * 100}%`;
        }, index * 100);
      });
    }
  }, [categoryTotals, totalAmount]);

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((cat) => cat.name === categoryName);
    return category?.color || '#6B7280';
  };

  if (categoryTotals.length === 0) {
    return (
      <Card className="h-full">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          {intl.formatMessage({ 
            id: type === 'income' ? 'dashboard.incomeByCategory' : 'dashboard.expenseByCategory' 
          })}
        </h3>
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-500 dark:text-gray-400">
            {intl.formatMessage({ id: 'transaction.noTransactions' })}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        {intl.formatMessage({ 
          id: type === 'income' ? 'dashboard.incomeByCategory' : 'dashboard.expenseByCategory' 
        })}
      </h3>
      <div ref={chartRef} className="space-y-4">
        {categoryTotals.map(({ category, total }) => (
          <div key={category} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {category}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {formatCurrency(total)} ({((total / totalAmount) * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="category-bar h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: '0%',
                  backgroundColor: getCategoryColor(category),
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CategoryChart;