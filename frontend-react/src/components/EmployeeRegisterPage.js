import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeRegisterPage.css'; // Nosso novo arquivo de estilo

function EmployeeRegisterPage() {
  // Um único estado para guardar todos os dados do formulário
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    matricula: '',
    cargo: '',
    tipo_vinculo: 'Efetivo',
    situacao: 'Ativo', // Valor padrão
    localizacao_fisica: '',
    data_admissao: '',
    pcd: false,
    readaptado: false,
    cid: '',
    data_readaptacao: '',
    data_aposentadoria: '',
    dodf_aposentadoria: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Função para atualizar o estado quando qualquer campo muda
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Pega o token do localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Você não está autenticado. Faça o login novamente.');
      // O ideal seria redirecionar para o login
      // navigate('/login');
      return;
    }

    try {
      // 2. Faz a chamada à API, incluindo o token no cabeçalho
      const response = await fetch('http://127.0.0.1:5000/funcionarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token // <-- O CRACHÁ DE AUTENTICAÇÃO!
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Mostra o erro que o backend enviou
        setError(data.message || 'Ocorreu um erro ao cadastrar o funcionário.');
        return;
      }

      // 3. Se deu tudo certo, mostra uma mensagem de sucesso e redireciona
      alert('Funcionário cadastrado com sucesso!');
      navigate('/buscar'); // Leva o usuário para a página de busca

    } catch (err) {
      setError('Não foi possível conectar ao servidor.');
      console.error('Erro de conexão:', err);
    }
  };

  return (
    <div className="employee-register-page">
      <h1>Cadastrar funcionário</h1>
      <form onSubmit={handleSubmit} className="employee-form">
        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="nome_completo">Nome*</label>
            <input type="text" id="nome_completo" name="nome_completo" value={formData.nome_completo} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cpf">CPF*</label>
            <input type="text" id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="matricula">Matrícula*</label>
            <input type="text" id="matricula" name="matricula" value={formData.matricula} onChange={handleChange} required/>
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

          <div className="form-group">
            <label htmlFor="situacao">Situação*</label>
            <select id="situacao" name="situacao" value={formData.situacao} onChange={handleChange} required>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
              <option value="Aposentado">Aposentado</option>
              <option value="Licenciado">Licenciado</option>
            </select>
          </div>
        </div>

        <div className="form-row">
           <div className="form-group">
            <label htmlFor="data_admissao">Data de admissão*</label>
            <input type="date" id="data_admissao" name="data_admissao" value={formData.data_admissao} onChange={handleChange} required/>
          </div>
          <div className="form-group">
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
          <button type="submit" className="submit-button">Cadastrar</button>
        </div>
      </form>
    </div>
  );
}

export default EmployeeRegisterPage;