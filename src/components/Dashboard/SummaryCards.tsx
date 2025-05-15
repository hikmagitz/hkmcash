import React from 'react';
import { useIntl } from 'react-intl';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/helpers';
import Card from '../UI/Card';

const SummaryCards: React.FC = () => {
  const { summary } = useTransactions();
  const intl = useIntl();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-l-4 border-green-500">
        <div className="flex items-center">
          <div className="mr-4 bg-green-100 p-3 rounded-full dark:bg-green-900">
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {intl.formatMessage({ id: 'dashboard.totalIncome' })}
            </h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(summary.totalIncome)}
            </p>
          </div>
        </div>
      </Card>
      
      <Card className="border-l-4 border-red-500">
        <div className="flex items-center">
          <div className="mr-4 bg-red-100 p-3 rounded-full dark:bg-red-900">
            <TrendingDown className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {intl.formatMessage({ id: 'dashboard.totalExpenses' })}
            </h3>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(summary.totalExpense)}
            </p>
          </div>
        </div>
      </Card>
      
      <Card className={`border-l-4 ${summary.balance >= 0 ? 'border-blue-500' : 'border-orange-500'}`}>
        <div className="flex items-center">
          <div className={`mr-4 ${
            summary.balance >= 0 
              ? 'bg-blue-100 dark:bg-blue-900' 
              : 'bg-orange-100 dark:bg-orange-900'
          } p-3 rounded-full`}>
            <DollarSign className={`h-6 w-6 ${
              summary.balance >= 0 
                ? 'text-blue-500' 
                : 'text-orange-500'
            }`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {intl.formatMessage({ id: 'dashboard.currentBalance' })}
            </h3>
            <p className={`text-2xl font-bold ${
              summary.balance >= 0 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-orange-600 dark:text-orange-400'
            }`}>
              {formatCurrency(summary.balance)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SummaryCards;