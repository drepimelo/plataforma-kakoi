import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './ProfilePage.css';

function ProfilePage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        setEmployee(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchEmployeeData();
  }, [id]);

  const handleDelete = async () => {
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
        navigate('/funcionarios');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleEdit = () => {
    navigate(`/funcionarios/editar/${id}`);
  };

  // Função auxiliar para formatar data evitando problemas de fuso horário
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  if (!employee && !error) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="profile-page">
      <Link to="/funcionarios" className="back-link">← Voltar para a busca</Link>
      
      <div className="profile-header">
        <div>
          <h1>{employee.nome_completo}</h1>
          <p>{employee.cargo}</p>
        </div>
        <div className="profile-actions">
          <button onClick={handleEdit} className="action-button edit">Editar perfil</button>
          <button onClick={handleDelete} className="action-button delete">Excluir funcionário</button>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <h3>Informações Pessoais</h3>
          <p><strong>CPF:</strong> {employee.cpf}</p>
          <p><strong>Matrícula:</strong> {employee.matricula || 'N/A'}</p>
          {/* --- NOVOS CAMPOS AQUI --- */}
          <p><strong>Data de Nascimento:</strong> {formatDate(employee.data_nascimento)}</p>
          <p><strong>Sexo:</strong> {employee.sexo || 'Não informado'}</p>
          {/* ------------------------- */}
          <p><strong>PCD:</strong> {employee.pcd ? 'Sim' : 'Não'}</p>
          {employee.pcd && <p><strong>CID:</strong> {employee.cid || 'Não informado'}</p>}
        </div>

        <div className="profile-card">
          <h3>Situação Funcional</h3>
          <p><strong>Situação:</strong> {employee.situacao}</p>
          <p><strong>Tipo de Vínculo:</strong> {employee.tipo_vinculo}</p>
          <p><strong>Data de Admissão:</strong> {formatDate(employee.data_admissao)}</p>
          
          {/* --- NOVO CAMPO DE DESLIGAMENTO --- */}
          {employee.data_desligamento && (
             <p><strong>Data de Desligamento:</strong> {formatDate(employee.data_desligamento)}</p>
          )}
          
          <p><strong>Localização Física:</strong> {employee.localizacao_fisica}</p>
        </div>
        
        {employee.readaptado && (
          <div className="profile-card">
            <h3>Readaptação</h3>
            <p><strong>Readaptado:</strong> Sim</p>
            <p><strong>Data de Readaptação:</strong> {formatDate(employee.data_readaptacao)}</p>
          </div>
        )}

        {(employee.data_aposentadoria || employee.situacao === 'Aposentado') && (
          <div className="profile-card">
            <h3>Aposentadoria</h3>
            <p><strong>Data de Aposentadoria:</strong> {formatDate(employee.data_aposentadoria)}</p>
            <p><strong>DODF da Aposentadoria:</strong> {employee.dodf_aposentadoria || 'Não informado'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;