import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import './App.css';

// Função para verificar se há um token
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// O componente Rota Privada continua o mesmo
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Se o usuário tentar ir para /login mas já estiver logado,
            será redirecionado para o /dashboard. Caso contrário, verá o LoginPage. */}
        <Route 
          path="/login" 
          element={isAuthenticated() ? <Navigate to="/dashboard" /> : <LoginPage />} 
        />

        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } 
        />
        
        {/* A rota padrão agora verifica a autenticação antes de redirecionar */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;