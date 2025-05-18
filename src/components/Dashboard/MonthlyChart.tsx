import React, { useEffect, useRef, useState } from 'react';
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
  const chartRef = useRef<HTMLDivElement>(null);
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
        months[`${monthStr}`] = {
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

  useEffect(() => {
    if (chartRef.current && monthlyData.length > 0) {
      // Animate bars
      const incomeBars = chartRef.current.querySelectorAll('.income-bar');
      const expenseBars = chartRef.current.querySelectorAll('.expense-bar');
      
      incomeBars.forEach((bar, index) => {
        setTimeout(() => {
          const height = (monthlyData[index].income / maxValue) * 100;
          (bar as HTMLElement).style.height = `${height}%`;
        }, index * 100);
      });
      
      expenseBars.forEach((bar, index) => {
        setTimeout(() => {
          const height = (monthlyData[index].expense / maxValue) * 100;
          (bar as HTMLElement).style.height = `${height}%`;
        }, index * 100 + 300);
      });
    }
  }, [monthlyData, maxValue]);

  return (
    <Card className="h-full">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        {intl.formatMessage({ id: 'dashboard.monthlyOverview' })}
      </h3>
      <div className="h-64">
        <div className="flex h-full">
          <div className="flex flex-col justify-between pr-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{formatCurrency(maxValue)}</span>
            <span>{formatCurrency(maxValue * 0.5)}</span>
            <span>{formatCurrency(0)}</span>
          </div>
          <div 
            ref={chartRef} 
            className="flex-1 flex items-end justify-between h-56 pt-4 border-t border-l border-gray-200 dark:border-gray-700"
          >
            {monthlyData.map((data) => (
              <div key={data.month} className="flex items-end space-x-2 h-full">
                <div className="flex flex-col items-center justify-end">
                  <div className="relative h-full w-8 flex items-end">
                    <div 
                      className="income-bar w-8 bg-green-500 transition-all duration-1000 ease-out rounded-t"
                      style={{ height: '0%' }}
                    ></div>
                  </div>
                  <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {data.month}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-end">
                  <div className="relative h-full w-8 flex items-end">
                    <div 
                      className="expense-bar w-8 bg-red-500 transition-all duration-1000 ease-out rounded-t"
                      style={{ height: '0%' }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-6 space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {intl.formatMessage({ id: 'transaction.income' })}
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {intl.formatMessage({ id: 'transaction.expense' })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MonthlyChart;