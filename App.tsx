import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/manager/Dashboard';
import Inventory from './pages/manager/Inventory';
import Billing from './pages/manager/Billing';
import Orders from './pages/manager/Orders';
import Shop from './pages/customer/Shop';
import Cart from './pages/customer/Cart';
import CustomerDashboard from './pages/customer/Dashboard';
import SmartAssistant from './pages/customer/SmartAssistant';
import History from './pages/common/History';
import Notifications from './pages/common/Notifications';
import { UserRole } from './types';

const AppContent = () => {
  const { user } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return <Login />;
  }

  // Routing Logic
  const renderPage = () => {
    // Common Pages
    if (currentPage === 'history') return <History />;
    if (currentPage === 'notifications') return <Notifications />;

    if (user.role === UserRole.MANAGER) {
      switch (currentPage) {
        case 'inventory': return <Inventory />;
        case 'billing': return <Billing />;
        case 'orders': return <Orders />;
        default: return <Dashboard />;
      }
    } else {
      switch (currentPage) {
        case 'cart': return <Cart />;
        case 'assistant': return <SmartAssistant />;
        case 'shop': return <Shop />;
        default: return <CustomerDashboard />;
      }
    }
  };

  return (
    <Layout activePage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;