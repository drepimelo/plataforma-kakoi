import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './ProfilePage.css';

function ProfilePage() {
  // O hook useParams nos permite ler parâmetros da URL (como o :id)
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // useEffect é um hook que executa código depois que o componente renderiza.
  // Perfeito para buscar dados de uma API.
  useEffect(() => {
    const fetchEmployeeData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Autenticação inválida.');
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:5000/funcionarios/${id}`, {
          headers: {
            'x-access-token': token,
          },
        });

        if (!response.ok) {
          throw new Error('Funcionário não encontrado ou erro no servidor.');
        }

        const data = await response.json();
        setEmployee(data); // Guarda os dados do funcionário no estado
      } catch (err) {
        setError(err.message);
      }
    };

    fetchEmployeeData();
  }, [id]); // O array [id] diz ao useEffect para rodar de novo se o id na URL mudar

  const handleDelete = async () => {
    // Pede uma confirmação ao usuário
    if (window.confirm('Tem certeza que deseja excluir este funcionário? Esta ação é irreversível.')) {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://127.0.0.1:5000/funcionarios/${id}`, {
          method: 'DELETE',
          headers: {
            'x-access-token': token,
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao excluir o funcionário.');
        }

        alert('Funcionário excluído com sucesso!');
        navigate('/funcionarios'); // Leva de volta para a busca
      } catch (err) {
        setError(err.message);
      }
    }
  };
  
  // Enquanto os dados estão carregando
  if (!employee && !error) {
    return <div>Carregando...</div>;
  }

  // Se deu erro
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="profile-page">
      <Link to="/funcionarios" className="back-link">← Voltar para a busca</Link>
      
      <div className="profile-header">
        <div> {/* Div para agrupar o nome e cargo */}
          <h1>{employee.nome_completo}</h1>
          <p>{employee.cargo}</p>
        </div>
        {/* --- NOVOS BOTÕES DE AÇÃO --- */}
        <div className="profile-actions">
          <button className="action-button edit">Editar perfil</button>
          <button onClick={handleDelete} className="action-button delete">Excluir funcionário</button>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <h3>Informações Pessoais</h3>
          <p><strong>CPF:</strong> {employee.cpf}</p>
          <p><strong>Matrícula:</strong> {employee.matricula || 'N/A'}</p>
          <p><strong>PCD:</strong> {employee.pcd ? 'Sim' : 'Não'}</p>
          {employee.pcd && <p><strong>CID:</strong> {employee.cid || 'Não informado'}</p>}
        </div>

        <div className="profile-card">
          <h3>Situação Funcional</h3>
          <p><strong>Situação:</strong> {employee.situacao}</p>
          <p><strong>Data de Admissão:</strong> {employee.data_admissao ? new Date(employee.data_admissao).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Localização Física:</strong> {employee.localizacao_fisica}</p>
        </div>
        
        {employee.readaptado && (
          <div className="profile-card">
            <h3>Readaptação</h3>
            <p><strong>Readaptado:</strong> Sim</p>
            <p><strong>Data de Readaptação:</strong> {employee.data_readaptacao ? new Date(employee.data_readaptacao).toLocaleDateString() : 'N/A'}</p>
          </div>
        )}

        {employee.situacao === 'Aposentado' && (
          <div className="profile-card">
            <h3>Aposentadoria</h3>
            <p><strong>Data de Aposentadoria:</strong> {employee.data_aposentadoria ? new Date(employee.data_aposentadoria).toLocaleDateString() : 'N/A'}</p>
            <p><strong>DODF da Aposentadoria:</strong> {employee.dodf_aposentadoria || 'Não informado'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;