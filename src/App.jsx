import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { AppProvider } from './context/AppContext.jsx';
import Layout from './components/common/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CreateVotePage from './pages/CreateVotePage.jsx';
import VoteDetailPage from './pages/VoteDetailPage.jsx';
import RestaurantListPage from './pages/RestaurantListPage.jsx';
import UserManagementPage from './pages/UserManagementPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettlementPage from './pages/SettlementPage.jsx';
import HelpPage from './pages/HelpPage.jsx';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <Layout>
                  <HomePage />
                </Layout>
              }
            />
            <Route
              path="/votes/create"
              element={
                <Layout>
                  <CreateVotePage />
                </Layout>
              }
            />
            <Route
              path="/votes/:id"
              element={
                <Layout>
                  <VoteDetailPage />
                </Layout>
              }
            />
            <Route
              path="/votes/:id/settlement"
              element={
                <Layout>
                  <SettlementPage />
                </Layout>
              }
            />
            <Route
              path="/restaurants"
              element={
                <Layout>
                  <RestaurantListPage />
                </Layout>
              }
            />
            <Route
              path="/admin/users"
              element={
                <Layout>
                  <UserManagementPage />
                </Layout>
              }
            />
            <Route
              path="/profile"
              element={
                <Layout>
                  <ProfilePage />
                </Layout>
              }
            />
            <Route
              path="/help"
              element={
                <Layout>
                  <HelpPage />
                </Layout>
              }
            />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
