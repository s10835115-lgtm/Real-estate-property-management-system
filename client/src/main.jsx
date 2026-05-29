import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AuthPage from './pages/AuthPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import EmiPage from './pages/EmiPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import HomePage from './pages/HomePage.jsx';
import MyListingsPage from './pages/MyListingsPage.jsx';
import PropertyDetailPage from './pages/PropertyDetailPage.jsx';
import PropertyListPage from './pages/PropertyListPage.jsx';
import './styles.css';

const root = document.getElementById('root');

function showStartupError(error) {
  console.error(error);
  root.innerHTML = '<div style="padding:24px;color:#842029;background:#f8d7da">The application could not start. Please refresh the page or check the browser console.</div>';
}

window.addEventListener('error', (event) => showStartupError(event.error || event.message));
window.addEventListener('unhandledrejection', (event) => showStartupError(event.reason));

try {
  createRoot(root).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/properties" element={<PropertyListPage />} />
              <Route path="/properties/:id" element={<PropertyDetailPage />} />
              <Route path="/emi-calculator" element={<EmiPage />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/register" element={<AuthPage mode="register" />} />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute roles={['buyer', 'seller', 'agent', 'admin']}>
                    <BookingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute roles={['buyer']}>
                    <FavoritesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-listings"
                element={
                  <ProtectedRoute roles={['seller', 'agent']}>
                    <MyListingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={['agent', 'admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          <ToastContainer position="top-right" autoClose={2500} />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} catch (error) {
  showStartupError(error);
}
