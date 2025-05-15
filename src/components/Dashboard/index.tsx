import React from 'react';
import SummaryCards from './SummaryCards';
import TransactionList from '../TransactionList';
import CategoryChart from './CategoryChart';
import MonthlyChart from './MonthlyChart';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <SummaryCards />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryChart type="expense" />
        <CategoryChart type="income" />
      </div>
      
      <MonthlyChart />
      
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Recent Transactions
        </h2>
        <TransactionList limit={5} />
      </div>
    </div>
  );
};

export default Dashboard;