import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EmployeeRegisterPage.css'; // Reutilizando o estilo

function EmployeeEditPage() {
  const { id } = useParams(); // Pega o ID do funcionário da URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null); // Inicia como nulo até carregarmos os dados
  const [error, setError] = useState('');

  // 1. useEffect para buscar os dados do funcionário quando a página carregar
  useEffect(() => {
    const fetchEmployeeData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://127.0.0.1:5000/funcionarios/${id}`, {
          headers: { 'x-access-token': token },
        });
        if (!response.ok) throw new Error('Funcionário não encontrado.');
        
        const data = await response.json();
        // Formata as datas para o formato YYYY-MM-DD que o input[type=date] espera
        Object.keys(data).forEach(key => {
            if (key.startsWith('data_') && data[key]) {
                data[key] = data[key].split('T')[0];
            }
        });
        setFormData(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchEmployeeData();
  }, [id]);

const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let finalValue;
    if (type === 'checkbox') {
      finalValue = checked;
    } else if (name === 'pcd' || name === 'readaptado') {
      // Converte a string "true" para o booleano true
      // e a string "false" (ou qualquer outra) para o booleano false.
      finalValue = (value === 'true');
    } else {
      finalValue = value;
    }

    setFormData(prevState => ({
      ...prevState,
      [name]: finalValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/funcionarios/${id}`, {
        method: 'PUT', // Usando o método PUT para atualizar
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao atualizar funcionário.');
      }

      alert('Funcionário atualizado com sucesso!');
      navigate(`/funcionarios/perfil/${id}`); // Volta para a página de perfil
    } catch (err) {
      setError(err.message);
    }
  };

  // Mostra uma mensagem de carregamento enquanto busca os dados
  if (!formData) {
    return <div>Carregando dados do funcionário...</div>;
  }

  return (
    <div className="employee-register-page">
      <h1>Editar funcionário</h1>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="employee-form">
        {/* O formulário é idêntico ao de cadastro, mas os campos são preenchidos pelos dados carregados */}
        {/* Exemplo para o campo nome: */}
        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="nome_completo">Nome*</label>
            <input type="text" id="nome_completo" name="nome_completo" value={formData.nome_completo} onChange={handleChange} required />
          </div>
        </div>
        
        {/* ... cole aqui o resto de TODOS os campos do formulário de EmployeeRegisterPage.js ... */}
        {/* Exatamente o mesmo JSX, eles serão preenchidos pelo estado 'formData' */}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cpf">CPF*</label>
            <input type="text" id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="matricula">Matrícula</label>
            <input type="text" id="matricula" name="matricula" value={formData.matricula} onChange={handleChange} />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cargo">Cargo*</label>
            <input type="text" id="cargo" name="cargo" value={formData.cargo} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="tipo_vinculo">Tipo de Vínculo*</label>
            <select id="tipo_vinculo" name="tipo_vinculo" value={formData.tipo_vinculo} onChange={handleChange} required>
              <option value="Efetivo">Efetivo</option>
              <option value="Temporário">Temporário</option>
              <option value="Estagiário">Estagiário</option>
              <option value="Voluntário">Voluntário</option>
              <option value="Terceirizado">Terceirizado</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="situacao">Situação*</label>
            <select id="situacao" name="situacao" value={formData.situacao} onChange={handleChange} required>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
              <option value="Aposentado">Aposentado</option>
              <option value="Licenciado">Licenciado</option>
            </select>
          </div>
           <div className="form-group">
            <label htmlFor="data_admissao">Data de admissão*</label>
            <input type="date" id="data_admissao" name="data_admissao" value={formData.data_admissao} onChange={handleChange} required/>
          </div>
        </div>
        
        <div className="form-row">
            <div className="form-group full-width">
                <label htmlFor="localizacao_fisica">Localização física do arquivo*</label>
                <input type="text" id="localizacao_fisica" name="localizacao_fisica" value={formData.localizacao_fisica} onChange={handleChange} required />
            </div>
        </div>

        <hr />

        <div className="form-row">
          <div className="form-group">
            <label>PCD</label>
            <select name="pcd" value={formData.pcd} onChange={handleChange}>
              <option value={false}>Não</option>
              <option value={true}>Sim</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="cid">CID</label>
            <input type="text" id="cid" name="cid" value={formData.cid} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Readaptado</label>
            <select name="readaptado" value={formData.readaptado} onChange={handleChange}>
              <option value={false}>Não</option>
              <option value={true}>Sim</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="data_readaptacao">Data de readaptação</label>
            <input type="date" id="data_readaptacao" name="data_readaptacao" value={formData.data_readaptacao} onChange={handleChange} />
          </div>
        </div>

        <hr />

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="data_aposentadoria">Data de aposentadoria</label>
            <input type="date" id="data_aposentadoria" name="data_aposentadoria" value={formData.data_aposentadoria} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="dodf_aposentadoria">DODF da aposentadoria</label>
            <input type="text" id="dodf_aposentadoria" name="dodf_aposentadoria" value={formData.dodf_aposentadoria} onChange={handleChange} />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">Salvar Alterações</button>
        </div>
      </form>
    </div>
  );
}

export default EmployeeEditPage;