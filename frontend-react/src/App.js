import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProfilePage from './components/ProfilePage';
import { AnimatePresence } from 'framer-motion';

// Importando todos os nossos componentes de página
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardPage from './components/DashboardPage';
import SearchPage from './components/SearchPage';
import EmployeeRegisterPage from './components/EmployeeRegisterPage';
import EmployeeEditPage from './components/EmployeeEditPage';
import ReportsPage from './components/ReportsPage';

// Importando o componente de Layout
import MainLayout from './components/MainLayout';

import { AuthProvider } from './context/AuthContext';

import './App.css';

// Função auxiliar para verificar a autenticação
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    // Pega o meio do token (payload)
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return false;

    // Decodifica de Base64 e transforma em objeto
    const payload = JSON.parse(atob(payloadBase64));

    // Verifica se o campo exp existe e se o token ainda não expirou
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      // Token expirado → remove pra evitar loop
      localStorage.removeItem('token');
      return false;
    }

    // Tudo certo
    return true;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    localStorage.removeItem('token');
    return false;
  }
};

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
      <AuthProvider>
        <AnimatePresence mode="wait">
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

            <Route 
              path="/funcionarios/editar/:id" 
              element={<PrivateRoute><EmployeeEditPage /></PrivateRoute>} 
            />
            <Route path="/relatorios" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
            {/* Placeholders para as rotas futuras */}

            <Route path="/preferencias" element={<PrivateRoute><h1>Página de Preferências</h1></PrivateRoute>} />

            {/* Rota "Catch-all": Redireciona para o local correto */}
            <Route 
              path="*" 
              element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} />} 
            />
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </Router>
  );
}

export default App;