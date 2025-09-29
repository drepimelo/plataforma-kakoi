import React from 'react';

function DashboardPage() {
  const handleLogout = () => {
    // Remove o token do localStorage
    localStorage.removeItem('token');
    // Recarrega a página para o roteador nos levar de volta ao login
    window.location.reload();
  };

  return (
    <div>
      <h1>Bem-vindo ao Painel!</h1>
      <p>Você está logado.</p>
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
}

export default DashboardPage;