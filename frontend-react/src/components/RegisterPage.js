import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Usaremos Link para o botão de voltar
import './LoginPage.css'; // Vamos reutilizar o estilo do login, que é similar
import './RegisterPage.css';


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
      <div className="singup-container">
        <Link to="/login"><button className="back-button"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h14M5 12l6 6m-6-6l6-6"/></svg>Voltar</button></Link>

        <h2>Cadastrar-se</h2>

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
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;