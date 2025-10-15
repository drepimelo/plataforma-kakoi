import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SearchPage.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1 // A mágica acontece aqui!
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};


function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (event) => {
    event.preventDefault();
    setError('');
    setHasSearched(true);

    if (!searchTerm) {
      setResults([]);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Autenticação inválida. Por favor, faça o login novamente.');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/funcionarios/buscar?nome=${searchTerm}`, {
        headers: {
          'x-access-token': token,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar funcionários.');
      }
      setResults(data);
    } catch (err) {
      setError(err.message);
      setResults([]);
    }
  };

  const viewProfile = (employeeId) => {
    navigate(`/funcionarios/perfil/${employeeId}`);
  };

  return (
    <div className="search-page">
      <div className="search-header-container">
      <div className="search-header">
        <div>
          <h1>Funcionários</h1>
        </div>
      </div>
        <form onSubmit={handleSearch} className="search-bar-container">
          
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m21 21l-4.34-4.34"/><circle cx="11" cy="11" r="8"/></g></svg>Buscar</button>
          <Link to="/funcionarios/cadastrar" className="btn-add-new">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0-8 0m8 12h6m-3-3v6M6 21v-2a4 4 0 0 1 4-4h4"/></svg>
          Cadastrar Funcionário
          </Link>
        </form>

      {error && <p className="error-message">{error}</p>}
      </div>
      <div className="results-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Matrícula</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? (
              results.map(employee => (
                <tr key={employee.id}>
                  <td>{employee.nome_completo}</td>
                  <td>{employee.matricula || 'N/A'}</td>
                  <td>{employee.situacao}</td>
                  <td>
                    <button onClick={() => viewProfile(employee.id)} className="action-button">
                      Ver perfil
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-6 6l6-6m-6-6l6 6"/></svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">
                  {hasSearched ? 'Nenhum funcionário encontrado.' : 'Digite um termo de busca para começar.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SearchPage;