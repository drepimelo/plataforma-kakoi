import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardPage from './components/DashboardPage';
import MainLayout from './components/MainLayout'; // 1. Importe o MainLayout
import './App.css';

const isAuthenticated = () => localStorage.getItem('token') !== null;

// A PrivateRoute agora usa o MainLayout para "envelopar" o conteúdo
const PrivateRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return <MainLayout>{children}</MainLayout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={isAuthenticated() ? <Navigate to="/dashboard" /> : <RegisterPage/>} />

        {/* Rotas protegidas */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/buscar" element={<PrivateRoute><h1>Página de Busca</h1></PrivateRoute>} />


        <Route 
          path="/login" 
          element={isAuthenticated() ? <Navigate to="/dashboard" /> : <LoginPage />} 
        />

        {/* Agora, todas as rotas protegidas ficam dentro do MainLayout */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } 
        />
        
        {/* Adicione placeholders para as outras rotas */}
        <Route path="/buscar" element={<PrivateRoute><h1>Página de Busca</h1></PrivateRoute>} />
        <Route path="/cadastrar" element={<PrivateRoute><h1>Página de Cadastro</h1></PrivateRoute>} />
        <Route path="/relatorios" element={<PrivateRoute><h1>Página de Relatórios</h1></PrivateRoute>} />
        <Route path="/preferencias" element={<PrivateRoute><h1>Página de Preferências</h1></PrivateRoute>} />

        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;