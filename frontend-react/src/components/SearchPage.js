import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SearchPage.css';

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
    alert(`Funcionalidade "Ver Perfil" para o ID: ${employeeId} ainda não implementada.`);
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <div>
          <h1>Funcionários</h1>
          <p>Busque, cadastre e gerencie os funcionários</p>
        </div>
        <Link to="/funcionarios/cadastrar" className="btn-add-new">
          Cadastrar Funcionário
        </Link>
      </div>

      <form onSubmit={handleSearch} className="search-bar-container">
        <input
          type="text"
          placeholder="Buscar por nome, CPF ou matrícula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">Buscar</button>
      </form>

      {error && <p className="error-message">{error}</p>}

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