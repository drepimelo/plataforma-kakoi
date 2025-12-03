import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PreferencesPage.css';

function PreferencesPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [editingField, setEditingField] = useState(null); // Qual campo está sendo editado?
  const [tempValue, setTempValue] = useState(''); // Valor temporário da edição
  
  // Estados para senha
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://127.0.0.1:5000/user/me', {
      headers: { 'x-access-token': token }
    });
    if (res.ok) setUser(await res.json());
  };

  // Inicia a edição de um campo
  const startEditing = (field, currentValue) => {
    setEditingField(field);
    setTempValue(currentValue || '');
  };

  // Salva a edição do campo
  const saveField = async () => {
    const token = localStorage.getItem('token');
    await fetch('http://127.0.0.1:5000/user/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-access-token': token },
      body: JSON.stringify({ [editingField]: tempValue })
    });
    setEditingField(null);
    fetchUser(); // Recarrega os dados
  };

  const handleChangePassword = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://127.0.0.1:5000/user/change-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-access-token': token },
      body: JSON.stringify({ new_password: newPassword })
    });
    if (res.ok) {
        alert('Senha alterada com sucesso!');
        setNewPassword('');
        setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('TEM CERTEZA? Isso apagará sua conta e todos os seus dados permanentemente.')) {
        const token = localStorage.getItem('token');
        await fetch('http://127.0.0.1:5000/user/delete', {
            method: 'DELETE',
            headers: { 'x-access-token': token }
        });
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };
  

  // Componente auxiliar para renderizar uma linha de opção
  const renderOption = (label, fieldKey, value) => (
    <div className="pref-row">
      <div className="pref-label">{label}:</div>
      <div className="pref-value">
        {editingField === fieldKey ? (
            <div className="edit-group">
                <input 
                    value={tempValue} 
                    onChange={(e) => setTempValue(e.target.value)} 
                    autoFocus
                />
                <button onClick={saveField} className="save-btn">Salvar</button>
                <button onClick={() => setEditingField(null)} className="cancel-btn">X</button>
            </div>
        ) : (
            <>
                <span>{value || 'Não informado'}</span>
                <button className="alterar-link" onClick={() => startEditing(fieldKey, value)}>Alterar</button>
            </>
        )}
      </div>
    </div>
  );

  const handleBackupDatabase = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://127.0.0.1:5000/database/download', {
        headers: { 'x-access-token': token },
      });
      if (!response.ok) throw new Error('Falha ao baixar backup.');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Define o nome com a data de hoje
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `backup_kakoi_${date}.db`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert(err.message);
    }
  };

  // 2. Função para RESTAURAR (Upload)
  const handleRestoreDatabase = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!window.confirm('PERIGO: Isso irá APAGAR todos os dados atuais e substituí-los pelo backup. Tem certeza absoluta?')) {
        // Limpa o input se o usuário cancelar
        event.target.value = ''; 
        return;
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:5000/database/upload', {
        method: 'POST',
        headers: { 
            'x-access-token': token 
            // Nota: Não defina Content-Type aqui, o navegador faz isso sozinho para FormData
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Erro ao restaurar.');

      alert('Sucesso! O sistema foi restaurado. A página será recarregada.');
      window.location.reload(); // Recarrega para pegar os novos dados

    } catch (err) {
      alert(err.message);
    }
  };
  

  return (
    <div className="preferences-page">
      <h1>Preferências</h1>
      
      <div className="pref-card">
        <h2>Conta do usuário</h2>
        
        {renderOption('Nome', 'name', user.name)}
        {renderOption('E-mail', 'email', user.email)}
        {renderOption('Cargo', 'cargo', user.cargo)}
        {renderOption('Instituição', 'instituicao', user.instituicao)}

        {/* Linha especial para Senha */}
        <div className="pref-row">
            <div className="pref-label">Senha:</div>
            <div className="pref-value">
                {isChangingPassword ? (
                    <div className="edit-group">
                        <input 
                            type="password" 
                            placeholder="Nova senha"
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                        />
                        <button onClick={handleChangePassword} className="save-btn">Salvar</button>
                        <button onClick={() => setIsChangingPassword(false)} className="cancel-btn">X</button>
                    </div>
                ) : (
                    <>
                        <span>********</span>
                        <button className="alterar-link" onClick={() => setIsChangingPassword(true)}>Alterar</button>
                    </>
                )}
            </div>
        </div>

        <hr />

        {/* Ações de Perigo / Download */}
        <div className="pref-actions">
          <hr />
            <h3>Gerenciamento de Dados</h3>
            
            {/* Botão de Backup */}
            <button className="action-btn download-btn" onClick={handleBackupDatabase}>
                ⬇ Fazer Backup do Banco de Dados (.db)
            </button>

            {/* Botão de Restore (Truque do input invisível) */}
            <label className="action-btn restore-btn">
                ⬆ Restaurar Backup (Upload)
                <input 
                    type="file" 
                    accept=".db" 
                    style={{ display: 'none' }} 
                    onChange={handleRestoreDatabase} 
                />
            </label>

        <hr />
            <button className="action-btn delete-btn" onClick={handleDeleteAccount}>Deletar conta</button>
            <button className="action-btn logout-btn" onClick={handleLogout}>Sair da conta</button>
        </div>

      </div>
    </div>
  );
}

export default PreferencesPage;