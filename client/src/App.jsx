import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import CategoriesPage from './pages/CategoriesPage';
import BicyclesPage from './pages/BicyclesPage';
import TariffsPage from './pages/TariffsPage';
import HistoryPage from './pages/HistoryPage';
import ApplicationsPage from './pages/ApplicationsPage';
import PromoCodesPage from './pages/PromoCodesPage';
import RentConditionsPage from './pages/RentConditionsPage';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/categories" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/categories" replace />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="categories/:categoryId/bicycles" element={<BicyclesPage />} />
        <Route path="categories/:categoryId/tariffs" element={<TariffsPage />} />
        <Route path="categories/:categoryId/conditions" element={<RentConditionsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="promocodes" element={<PromoCodesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/categories" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}