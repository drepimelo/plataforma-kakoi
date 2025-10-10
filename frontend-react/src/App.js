import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProfilePage from './components/ProfilePage';

// Importando todos os nossos componentes de página
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardPage from './components/DashboardPage';
import SearchPage from './components/SearchPage';
import EmployeeRegisterPage from './components/EmployeeRegisterPage';

// Importando o componente de Layout
import MainLayout from './components/MainLayout';

import './App.css';

// Função auxiliar para verificar a autenticação
const isAuthenticated = () => localStorage.getItem('token') !== null;

// Componente para proteger rotas
const PrivateRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  // Envolve as páginas protegidas com o layout principal
  return <MainLayout>{children}</MainLayout>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas Públicas: Login e Registro */}
        <Route 
          path="/login" 
          element={isAuthenticated() ? <Navigate to="/dashboard" /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated() ? <Navigate to="/dashboard" /> : <RegisterPage />} 
        />

        {/* Rotas Privadas (dentro do PrivateRoute) */}
        <Route 
          path="/dashboard" 
          element={<PrivateRoute><DashboardPage /></PrivateRoute>} 
        />
        <Route 
          path="/funcionarios" 
          element={<PrivateRoute><SearchPage /></PrivateRoute>} 
        />
        <Route 
          path="/funcionarios/cadastrar" 
          element={<PrivateRoute><EmployeeRegisterPage /></PrivateRoute>} 
        />
        
        <Route 
          path="/funcionarios/perfil/:id" 
          element={<PrivateRoute><ProfilePage /></PrivateRoute>} 
        />

        {/* Placeholders para as rotas futuras */}
        <Route path="/relatorios" element={<PrivateRoute><h1>Página de Relatórios</h1></PrivateRoute>} />
        <Route path="/preferencias" element={<PrivateRoute><h1>Página de Preferências</h1></PrivateRoute>} />

        {/* Rota "Catch-all": Redireciona para o local correto */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;