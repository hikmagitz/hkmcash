import React from 'react';
import { useTransaction } from './context/TransactionContext';

function App() {
  const { isAuthenticated, user, login, logout } = useTransaction();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-white font-bold text-2xl">H</span>
        </div>
        
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent mb-6">
          HKM Cash
        </h1>

        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                Bienvenue, {user?.name}!
              </h2>
              <p className="text-green-600 dark:text-green-400 text-sm">
                Vous êtes maintenant connecté à votre tableau de bord financier.
              </p>
            </div>
            
            <button
              onClick={logout}
              className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Se déconnecter
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                Connectez-vous pour accéder à vos finances
              </p>
            </div>
            
            <button
              onClick={login}
              className="w-full py-3 px-6 bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Se connecter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;