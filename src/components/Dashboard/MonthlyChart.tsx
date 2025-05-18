import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/helpers';
import Card from '../UI/Card';

interface MonthData {
  month: string;
  income: number;
  expense: number;
}

const MonthlyChart: React.FC = () => {
  const { transactions } = useTransactions();
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [maxValue, setMaxValue] = useState(0);
  const intl = useIntl();

  useEffect(() => {
    const calculateMonthlyData = () => {
      const months: Record<string, MonthData> = {};
      const currentYear = new Date().getFullYear();
      
      // Initialize last 2 months
      for (let i = 1; i >= 0; i--) {
        const date = new Date(currentYear, new Date().getMonth() - i, 1);
        const monthStr = date.toLocaleString(intl.locale, { month: 'short' });
        months[monthStr] = {
          month: monthStr,
          income: 0,
          expense: 0,
        };
      }
      
      // Fill with transaction data
      transactions.forEach((transaction) => {
        const date = new Date(transaction.date);
        const monthStr = date.toLocaleString(intl.locale, { month: 'short' });
        
        if (months[monthStr]) {
          if (transaction.type === 'income') {
            months[monthStr].income += transaction.amount;
          } else {
            months[monthStr].expense += transaction.amount;
          }
        }
      });
      
      const data = Object.values(months);
      
      // Calculate max value for chart scaling
      const max = data.reduce(
        (max, item) => Math.max(max, item.income, item.expense),
        0
      );
      
      setMonthlyData(data);
      setMaxValue(max * 1.2); // Add 20% padding
    };
    
    calculateMonthlyData();
  }, [transactions, intl.locale]);

  return (
    <Card className="h-full">
      <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-white">
        {intl.formatMessage({ id: 'dashboard.monthlyOverview' })}
      </h3>
      
      <div className="space-y-8">
        {monthlyData.map((data) => (
          <div key={data.month} className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {data.month}
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Income</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatCurrency(data.income)} ({((data.income / maxValue) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${(data.income / maxValue) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Expense</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatCurrency(data.expense)} ({((data.expense / maxValue) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${(data.expense / maxValue) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MonthlyChart;