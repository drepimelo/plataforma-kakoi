import React from 'react';
import { NavLink } from 'react-router-dom'; // Usaremos NavLink para os links de navegação
import './Sidebar.css';

function Sidebar() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login'; // Redireciona para o login
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        {/* Futuramente, o logo virá aqui */}
        <h3>Kakoi</h3>
      </div>
      <nav className="sidebar-nav">
        {/* NavLink adiciona uma classe 'active' ao link da página atual */}
        <NavLink to="/dashboard">Meu painel</NavLink>
        <NavLink to="/buscar">Buscar funcionários</NavLink>
        <NavLink to="/cadastrar">Cadastrar funcionários</NavLink>
        <NavLink to="/relatorios">Relatórios</NavLink>
        <NavLink to="/preferencias">Preferências</NavLink>
      </nav>
      <div className="sidebar-footer">
        {/* A função de logout agora pode ficar aqui */}
        <button onClick={handleLogout} className="logout-button">
          Sair
        </button>
      </div>
    </div>
  );
}

export default Sidebar;