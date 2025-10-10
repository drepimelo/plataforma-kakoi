import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import "./LoginPage.css"; // Importa nosso arquivo de estilo

function LoginPage() {
  const [email, setEmail] = useState(''); // O valor inicial é uma string vazia
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const navigate = useNavigate();

  
   // 5. Crie a função que será chamada quando o formulário for enviado
  const handleSubmit = async (event) => { // 2. Transformamos a função em 'async'
    event.preventDefault();
    setError(''); // Limpa erros anteriores a cada nova tentativa

    try {
      // 3. O 'fetch' para chamar nossa API de login
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Envia o email e a senha no corpo da requisição
      });

      const data = await response.json();

      if (!response.ok) {
        // Se a resposta não for de sucesso (ex: 401 Credenciais inválidas),
        // guardamos a mensagem de erro que vem do backend
        setError(data.message || 'Erro ao fazer login.');
        return; // Interrompe a execução
      }

      // 4. Se o login for bem-sucedido...
      console.log('Login bem-sucedido!');
      console.log('Token recebido:', data.token);
      
      // Futuramente, aqui salvaremos o token e redirecionaremos o usuário
      // --- MUDANÇA IMPORTANTE AQUI ---
      // 1. Salve o token no localStorage
      localStorage.setItem('token', data.token);

      navigate('/dashboard'); 

      // 2. Recarregue a página. O nosso roteador (que vamos criar a seguir)
      // irá detectar o token e nos levar para a página correta.
      window.location.reload();

    } catch (err) {
      // Erro de rede ou se o backend não estiver rodando
      setError('Não foi possível conectar ao servidor.');
      console.error('Erro de conexão:', err);
      
    }

    
  };
  return (
    <div className="login-page">

      <h2>Bem-vindo a Plataforma Kakoi!</h2>

      <div className="login-container">
        <h3 className="login-title">Login</h3>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">E-mail:</label>
            <input type="email" id="email" placeholder="Insira seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha:</label>
            <input
              type="password"
              id="password"
              placeholder="Insira sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-button">
            Entrar
          </button>

          <div className="form-footer">
            <Link to="/register">Cadastrar</Link>
            <a href="#">(Esqueci minha senha)</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
