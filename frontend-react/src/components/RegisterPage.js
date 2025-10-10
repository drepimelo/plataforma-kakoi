import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Usaremos Link para o botão de voltar
import './LoginPage.css'; // Vamos reutilizar o estilo do login, que é similar

function RegisterPage() {
  // Estados para cada campo do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargo, setCargo] = useState('');
  const [instituicao, setInstituicao] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Cria o objeto com os dados para enviar ao backend
    const userData = { email, password, cargo, instituicao };

    try {
      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Erro ao cadastrar.');
        return;
      }

      // Se o cadastro for bem-sucedido, avisa o usuário e o leva para o login
      alert('Cadastro realizado com sucesso! Faça o login para continuar.');
      navigate('/login');

    } catch (err) {
      setError('Não foi possível conectar ao servidor.');
      console.error('Erro de conexão:', err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Cadastro na Plataforma Kakoi</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}

          <div className="input-group">
            <label htmlFor="email">E-mail:</label>
            <input type="email" id="email" placeholder="Insira seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha:</label>
            <input type="password" id="password" placeholder="Insira sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="input-group">
            <label htmlFor="cargo">Cargo:</label>
            <input type="text" id="cargo" placeholder="Insira seu cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} required />
          </div>

          <div className="input-group">
            <label htmlFor="instituicao">Instituição:</label>
            <input type="text" id="instituicao" placeholder="Insira sua instituição" value={instituicao} onChange={(e) => setInstituicao(e.target.value)} required />
          </div>

          <button type="submit" className="login-button">Cadastrar</button>

          <div className="form-footer">
            {/* O Link do React Router nos leva de volta ao login sem recarregar a página */}
            <Link to="/login">Voltar para o Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;