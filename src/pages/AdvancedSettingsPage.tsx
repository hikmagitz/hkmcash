import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Euro, 
  Save, 
  Edit3, 
  Check, 
  X, 
  Settings,
  ArrowLeft,
  Sparkles,
  Globe,
  Briefcase,
  Zap,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useTransactions } from '../context/TransactionContext';
import { SUPPORTED_CURRENCIES } from '../utils/helpers';

const AdvancedSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const { enterpriseName, setEnterpriseName } = useTransactions();

  // Loading states
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  // Enterprise name state
  const [isEditingEnterprise, setIsEditingEnterprise] = useState(false);
  const [tempEnterpriseName, setTempEnterpriseName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Currency state
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [isEditingCurrency, setIsEditingCurrency] = useState(false);
  const [tempCurrency, setTempCurrency] = useState('EUR');
  const [currencySaveSuccess, setCurrencySaveSuccess] = useState(false);

  // Initialize states
  useEffect(() => {
    setTempEnterpriseName(enterpriseName);
    const savedCurrency = localStorage.getItem('preferredCurrency') || 'EUR';
    setSelectedCurrency(savedCurrency);
    setTempCurrency(savedCurrency);
  }, [enterpriseName]);

  const getCurrentCurrencyInfo = () => {
    return SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrency) || SUPPORTED_CURRENCIES[0];
  };

  const setLoading = (key: string, value: boolean) => {
    setIsLoading(prev => ({ ...prev, [key]: value }));
  };

  // Enterprise functions
  const handleStartEditingEnterprise = () => {
    setIsEditingEnterprise(true);
    setTempEnterpriseName(enterpriseName);
    setSaveSuccess(false);
  };

  const handleCancelEditingEnterprise = () => {
    setIsEditingEnterprise(false);
    setTempEnterpriseName(enterpriseName);
    setSaveSuccess(false);
  };

  const handleSaveEnterpriseName = async () => {
    setLoading('saveEnterprise', true);
    setSaveSuccess(false);
    
    try {
      await setEnterpriseName(tempEnterpriseName.trim());
      setIsEditingEnterprise(false);
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving enterprise name:', error);
      alert('Failed to save company name. Please try again.');
    } finally {
      setLoading('saveEnterprise', false);
    }
  };

  // Currency functions
  const handleStartEditingCurrency = () => {
    setIsEditingCurrency(true);
    setTempCurrency(selectedCurrency);
    setCurrencySaveSuccess(false);
  };

  const handleCancelEditingCurrency = () => {
    setIsEditingCurrency(false);
    setTempCurrency(selectedCurrency);
    setCurrencySaveSuccess(false);
  };

  const handleSaveCurrency = async () => {
    setLoading('saveCurrency', true);
    setCurrencySaveSuccess(false);
    
    try {
      setSelectedCurrency(tempCurrency);
      localStorage.setItem('preferredCurrency', tempCurrency);
      setIsEditingCurrency(false);
      setCurrencySaveSuccess(true);
      
      setTimeout(() => {
        setCurrencySaveSuccess(false);
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error saving currency:', error);
      alert('Failed to save currency. Please try again.');
    } finally {
      setLoading('saveCurrency', false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                type="secondary"
                onClick={() => navigate('/settings')}
                className="!p-2 hover:scale-105 transition-transform"
              >
                <ArrowLeft size={18} />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="w-2 h-2 text-white" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Paramètres Avancés
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Personnalisez votre expérience HKM Cash
                  </p>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Synchronisé
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Enterprise Settings */}
          <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all hover:scale-110">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Entreprise
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nom affiché sur les documents
                  </p>
                </div>
              </div>

              {!isEditingEnterprise ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border-l-4 border-blue-500 hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                        Nom actuel
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                      {enterpriseName || 'Aucun nom défini'}
                    </p>
                  </div>
                  
                  <Button
                    type="primary"
                    onClick={handleStartEditingEnterprise}
                    className="w-full group-hover:scale-105 transition-transform"
                  >
                    <Edit3 size={18} />
                    Modifier le nom
                  </Button>
                  
                  {saveSuccess && (
                    <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-slide-up">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-green-500 rounded-full">
                          <Check size={12} className="text-white" />
                        </div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">
                          Nom d'entreprise sauvegardé avec succès !
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={tempEnterpriseName}
                      onChange={(e) => setTempEnterpriseName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEnterpriseName()}
                      placeholder="Entrez le nom de votre entreprise"
                      className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all hover:border-blue-400"
                      disabled={isLoading.saveEnterprise}
                      autoFocus
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      type="primary"
                      onClick={handleSaveEnterpriseName}
                      disabled={!tempEnterpriseName.trim()}
                      loading={isLoading.saveEnterprise}
                      className="flex-1"
                    >
                      <Save size={18} />
                      Sauvegarder
                    </Button>
                    <Button
                      type="secondary"
                      onClick={handleCancelEditingEnterprise}
                      disabled={isLoading.saveEnterprise}
                      className="flex-1"
                    >
                      <X size={18} />
                      Annuler
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-6 p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg border border-blue-200/50 dark:border-blue-800/50 hover:shadow-sm transition-all">
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-blue-500 rounded-full mt-0.5">
                    <Check size={10} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Utilisations du nom d'entreprise :
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-0.5">
                      <li>• Reçus PDF générés</li>
                      <li>• Exports Excel</li>
                      <li>• En-têtes de documents</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Currency Settings */}
          <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all hover:scale-110">
                  <Euro className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Devise
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Affichage des montants
                  </p>
                </div>
              </div>

              {!isEditingCurrency ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 rounded-xl border-l-4 border-green-500 hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                        Devise actuelle
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getCurrentCurrencyInfo().symbol}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                          {getCurrentCurrencyInfo().name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {getCurrentCurrencyInfo().code}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    type="primary"
                    onClick={handleStartEditingCurrency}
                    className="w-full group-hover:scale-105 transition-transform"
                  >
                    <Edit3 size={18} />
                    Changer la devise
                  </Button>
                  
                  {currencySaveSuccess && (
                    <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-slide-up">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-green-500 rounded-full">
                          <Check size={12} className="text-white" />
                        </div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">
                          Devise sauvegardée ! Rechargement en cours...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <select
                      value={tempCurrency}
                      onChange={(e) => setTempCurrency(e.target.value)}
                      className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all appearance-none hover:border-green-400"
                      disabled={isLoading.saveCurrency}
                      autoFocus
                    >
                      {SUPPORTED_CURRENCIES.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name} ({currency.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      type="primary"
                      onClick={handleSaveCurrency}
                      loading={isLoading.saveCurrency}
                      className="flex-1"
                    >
                      <Save size={18} />
                      Sauvegarder
                    </Button>
                    <Button
                      type="secondary"
                      onClick={handleCancelEditingCurrency}
                      disabled={isLoading.saveCurrency}
                      className="flex-1"
                    >
                      <X size={18} />
                      Annuler
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-6 p-3 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg border border-green-200/50 dark:border-green-800/50 hover:shadow-sm transition-all">
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-green-500 rounded-full mt-0.5">
                    <Check size={10} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                      La devise sera utilisée pour :
                    </p>
                    <ul className="text-xs text-green-600 dark:text-green-400 space-y-0.5">
                      <li>• Affichage des montants</li>
                      <li>• Rapports et exports</li>
                      <li>• Calculs de totaux</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Info Section */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all cursor-pointer">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tous les changements sont automatiquement sauvegardés
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettingsPage;