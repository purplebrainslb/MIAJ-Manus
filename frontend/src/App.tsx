import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '/styles/global.css';
import Header from '/components/layout/Header';
import Footer from '/components/layout/Footer';
import HomePage from '/pages/HomePage';
import LoginPage from '/pages/LoginPage';
import RegisterPage from '/pages/RegisterPage';
import DashboardPage from '/pages/DashboardPage';
import CreateRelationshipPage from '/pages/CreateRelationshipPage';
import RelationshipDetailPage from '/pages/RelationshipDetailPage';
import AddMemoryPage from '/pages/AddMemoryPage';
import RevealPage from '/pages/RevealPage';
import NotFoundPage from '/pages/NotFoundPage';
import PrivateRoute from '/components/auth/PrivateRoute';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/relationships/create" 
              element={
                <PrivateRoute>
                  <CreateRelationshipPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/relationships/:id" 
              element={
                <PrivateRoute>
                  <RelationshipDetailPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/relationships/:id/add-memory" 
              element={
                <PrivateRoute>
                  <AddMemoryPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/relationships/:id/reveal" 
              element={
                <PrivateRoute>
                  <RevealPage />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
