import React from 'react';
import Sidebar from './Sidebar';

// Este componente recebe as "páginas filhas" como uma propriedade especial 'children'
function MainLayout({ children }) {
  const layoutStyle = {
    display: 'flex'
  };

  const contentStyle = {
    flexGrow: 1,
    padding: '20px',
    marginLeft: '250px' // O espaço para a Sidebar fixa
  };

  return (
    <div style={layoutStyle}>
      <Sidebar />
      <main style={contentStyle}>
        {children} {/* Aqui é onde as outras páginas (Dashboard, Busca, etc.) serão renderizadas */}
      </main>
    </div>
  );
}

export default MainLayout;