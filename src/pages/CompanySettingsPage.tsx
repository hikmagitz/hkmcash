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
  Star,
  Shield,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useTransactions } from '../context/TransactionContext';
import { SUPPORTED_CURRENCIES } from '../utils/helpers';

const CompanySettingsPage: React.FC = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-indigo-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                type="secondary"
                onClick={() => navigate('/settings')}
                className="!p-3 hover:scale-110 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <ArrowLeft size={20} />
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Paramètres Entreprise
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Configuration de votre entreprise et devise
                  </p>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                Sécurisé & Synchronisé
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl border border-indigo-200 dark:border-indigo-800 mb-6 hover:shadow-lg transition-all duration-300">
            <Lock className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              Configuration Sécurisée
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
            Personnalisez votre espace de travail
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Configurez le nom de votre entreprise et votre devise préférée pour une expérience personnalisée
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          
          {/* Enterprise Settings */}
          <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden border-0 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl shadow-xl group-hover:shadow-2xl transition-all duration-300 hover:scale-110">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Nom d'Entreprise
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Affiché sur tous vos documents officiels
                  </p>
                </div>
              </div>

              {!isEditingEnterprise ? (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 rounded-2xl border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Nom Actuel
                      </span>
                    </div>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">
                      {enterpriseName || 'Aucun nom défini'}
                    </p>
                    {!enterpriseName && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Définissez le nom de votre entreprise pour personnaliser vos documents
                      </p>
                    )}
                  </div>
                  
                  <Button
                    type="primary"
                    onClick={handleStartEditingEnterprise}
                    className="w-full py-4 text-lg group-hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Edit3 size={20} />
                    {enterpriseName ? 'Modifier le nom' : 'Définir le nom'}
                  </Button>
                  
                  {saveSuccess && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl animate-slide-up shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-full shadow-md">
                          <Check size={14} className="text-white" />
                        </div>
                        <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                          Nom d'entreprise sauvegardé avec succès !
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={tempEnterpriseName}
                      onChange={(e) => setTempEnterpriseName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEnterpriseName()}
                      placeholder="Entrez le nom de votre entreprise"
                      className="w-full px-6 py-4 text-lg border-2 border-blue-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 hover:border-blue-400 shadow-lg"
                      disabled={isLoading.saveEnterprise}
                      autoFocus
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <Button
                      type="primary"
                      onClick={handleSaveEnterpriseName}
                      disabled={!tempEnterpriseName.trim()}
                      loading={isLoading.saveEnterprise}
                      className="flex-1 py-3 shadow-lg hover:shadow-xl"
                    >
                      <Save size={18} />
                      Sauvegarder
                    </Button>
                    <Button
                      type="secondary"
                      onClick={handleCancelEditingEnterprise}
                      disabled={isLoading.saveEnterprise}
                      className="flex-1 py-3 shadow-lg hover:shadow-xl"
                    >
                      <X size={18} />
                      Annuler
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-200/50 dark:border-blue-800/50 hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-blue-500 rounded-full mt-1">
                    <Check size={12} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Utilisations du nom d'entreprise :
                    </p>
                    <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                      <li className="flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Reçus PDF générés
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Exports Excel
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        En-têtes de documents
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Currency Settings */}
          <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden border-0 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl shadow-xl group-hover:shadow-2xl transition-all duration-300 hover:scale-110">
                  <Euro className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Devise Préférée
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Format d'affichage des montants
                  </p>
                </div>
              </div>

              {!isEditingCurrency ? (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 rounded-2xl border-l-4 border-green-500 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <Globe className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
                        Devise Actuelle
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold text-green-600">
                        {getCurrentCurrencyInfo().symbol}
                      </div>
                      <div>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">
                          {getCurrentCurrencyInfo().name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Code: {getCurrentCurrencyInfo().code}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    type="primary"
                    onClick={handleStartEditingCurrency}
                    className="w-full py-4 text-lg group-hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Edit3 size={20} />
                    Changer la devise
                  </Button>
                  
                  {currencySaveSuccess && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl animate-slide-up shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-full shadow-md">
                          <Check size={14} className="text-white" />
                        </div>
                        <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                          Devise sauvegardée ! Rechargement en cours...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <select
                      value={tempCurrency}
                      onChange={(e) => setTempCurrency(e.target.value)}
                      className="w-full px-6 py-4 text-lg border-2 border-green-300 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 appearance-none hover:border-green-400 shadow-lg"
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
                  
                  <div className="flex gap-4">
                    <Button
                      type="primary"
                      onClick={handleSaveCurrency}
                      loading={isLoading.saveCurrency}
                      className="flex-1 py-3 shadow-lg hover:shadow-xl"
                    >
                      <Save size={18} />
                      Sauvegarder
                    </Button>
                    <Button
                      type="secondary"
                      onClick={handleCancelEditingCurrency}
                      disabled={isLoading.saveCurrency}
                      className="flex-1 py-3 shadow-lg hover:shadow-xl"
                    >
                      <X size={18} />
                      Annuler
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-8 p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-xl border border-green-200/50 dark:border-green-800/50 hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-green-500 rounded-full mt-1">
                    <Check size={12} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                      La devise sera utilisée pour :
                    </p>
                    <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                      <li className="flex items-center gap-2">
                        <Star className="w-3 h-3" />
                        Affichage des montants
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="w-3 h-3" />
                        Rapports et exports
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="w-3 h-3" />
                        Calculs de totaux
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Info Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl border border-indigo-200 dark:border-indigo-800 hover:shadow-xl transition-all duration-300 cursor-pointer">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Tous les changements sont automatiquement sauvegardés et sécurisés
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySettingsPage;