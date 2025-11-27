import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './DashboardPage.css';

function DashboardPage() {
  const [userInfo, setUserInfo] = useState({ email: '', cargo: '', instituicao: '' });
  const [tasks, setTasks] = useState([]);
  const [avisos, setAvisos] = useState([]);
  
  // Estados para os formulários
  const [newTask, setNewTask] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(''); // Nova data da tarefa
  
  const [newAviso, setNewAviso] = useState('');
  const [newAvisoDate, setNewAvisoDate] = useState(''); // Nova data do aviso

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'x-access-token': token };

    const userRes = await fetch('http://127.0.0.1:5000/user/me', { headers });
    if (userRes.ok) setUserInfo(await userRes.json());

    const taskRes = await fetch('http://127.0.0.1:5000/tarefas', { headers });
    if (taskRes.ok) setTasks(await taskRes.json());

    const avisoRes = await fetch('http://127.0.0.1:5000/avisos', { headers });
    if (avisoRes.ok) setAvisos(await avisoRes.json());
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask) return;
    const token = localStorage.getItem('token');
    await fetch('http://127.0.0.1:5000/tarefas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-access-token': token },
      body: JSON.stringify({ 
          conteudo: newTask,
          data_prazo: newTaskDate // Envia a data
      })
    });
    setNewTask('');
    setNewTaskDate('');
    fetchData();
  };

  const moveTask = async (id, newStatus) => {
    const token = localStorage.getItem('token');
    await fetch(`http://127.0.0.1:5000/tarefas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-access-token': token },
      body: JSON.stringify({ status: newStatus })
    });
    fetchData();
  };

  const deleteTask = async (id) => {
      const token = localStorage.getItem('token');
      await fetch(`http://127.0.0.1:5000/tarefas/${id}`, {
        method: 'DELETE',
        headers: { 'x-access-token': token }
      });
      fetchData();
  }

  const addAviso = async (e) => {
    e.preventDefault();
    if (!newAviso) return;
    const token = localStorage.getItem('token');
    await fetch('http://127.0.0.1:5000/avisos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-access-token': token },
      body: JSON.stringify({ 
          conteudo: newAviso,
          data_prazo: newAvisoDate // Envia a data
      })
    });
    setNewAviso('');
    setNewAvisoDate('');
    fetchData();
  };

  // Nova função para deletar avisos
  const deleteAviso = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`http://127.0.0.1:5000/avisos/${id}`, {
      method: 'DELETE',
      headers: { 'x-access-token': token }
    });
    fetchData();
  };

  // --- LÓGICA MÁGICA DO CALENDÁRIO ---
  // Essa função roda para CADA dia do calendário para decidir o que desenhar
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
        // Formata a data do calendário para YYYY-MM-DD para comparar com o banco
        const dateString = date.toISOString().split('T')[0];

        // Verifica se tem tarefa nesse dia
        const hasTask = tasks.some(t => t.data_prazo === dateString && t.status !== 'concluido');
        // Verifica se tem aviso nesse dia
        const hasAviso = avisos.some(a => a.data_prazo === dateString);

        if (hasTask || hasAviso) {
            return (
                <div className="calendar-dots">
                    {hasTask && <span className="dot task-dot"></span>}
                    {hasAviso && <span className="dot aviso-dot"></span>}
                </div>
            );
        }
    }
  };

  return (
    <div className="dashboard-page">
      {/* ... (Seção Kanban) ... */}
      <div className="dashboard-section kanban-section">
        {/* ... (Colunas existentes) ... */}
        
        {/* Apenas atualize o FORMULÁRIO de adicionar tarefa para incluir data */}
        <div className="kanban-column">
            <h3>A fazer</h3>
            <div className="task-list">
                {tasks.filter(t => t.status === 'afazer').map(t => (
                <div key={t.id} className="task-card color-yellow">
                    <p>{t.conteudo}</p>
                    {/* Mostra a data se existir */}
                    {t.data_prazo && <small className="task-date">📅 {new Date(t.data_prazo).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</small>}
                    <div className="task-actions">
                        <button onClick={() => moveTask(t.id, 'andamento')}>→</button>
                        <button onClick={() => deleteTask(t.id)}>x</button>
                    </div>
                </div>
                ))}
            </div>
            <form onSubmit={addTask} className="add-task-form">
                <input 
                type="text" 
                placeholder="+ Nova tarefa" 
                value={newTask} 
                onChange={(e) => setNewTask(e.target.value)} 
                />
                {/* Input de Data Pequeno */}
                <input 
                    type="date" 
                    className="date-input-small"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                />
                <button type="submit" style={{display:'none'}}></button>
            </form>
        </div>
        {/* ... (Repita a lógica de exibir a data <small> para as outras colunas também) ... */}
        <div className="kanban-column">
          <h3>Em andamento</h3>
          <div className="task-list">
            {tasks.filter(t => t.status === 'andamento').map(t => (
              <div key={t.id} className="task-card color-red">
                <p>{t.conteudo}</p>
                {t.data_prazo && <small className="task-date">📅 {new Date(t.data_prazo).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</small>}
                <div className="task-actions">
                  <button onClick={() => moveTask(t.id, 'afazer')}>←</button>
                  <button onClick={() => moveTask(t.id, 'concluido')}>→</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="kanban-column">
          <h3>Concluído</h3>
          <div className="task-list">
            {tasks.filter(t => t.status === 'concluido').map(t => (
              <div key={t.id} className="task-card color-green">
                <p>{t.conteudo}</p>
                {t.data_prazo && <small className="task-date">📅 {new Date(t.data_prazo).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</small>}
                <div className="task-actions">
                  <button onClick={() => moveTask(t.id, 'andamento')}>←</button>
                  <button onClick={() => deleteTask(t.id)}>x</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. PERFIL (Mantém igual) */}
      <div className="dashboard-section profile-section">
        <div className="profile-image-placeholder">
           {userInfo.email ? userInfo.email[0].toUpperCase() : 'U'}
        </div>
        <h2>{userInfo.name}</h2>
        <p className="role">{userInfo.cargo || 'Cargo não definido'}</p>
        <p className="institution">{userInfo.instituicao || 'Instituição'}</p>
      </div>

      {/* 3. AVISOS (Atualizado com Delete e Data) */}
      <div className="dashboard-section notes-section">
        <h3>Avisos</h3>
        <div className="notes-list">
            {avisos.map(a => (
                <div key={a.id} className="note-item">
                    <div className="note-content">
                        <span>• {a.conteudo}</span>
                        {a.data_prazo && <small className="note-date">{new Date(a.data_prazo).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</small>}
                    </div>
                    {/* Botão de Delete */}
                    <button onClick={() => deleteAviso(a.id)} className="delete-note-btn">x</button>
                </div>
            ))}
        </div>
        <form onSubmit={addAviso} className="add-note-form">
            <input 
                type="text" 
                placeholder="Novo aviso..." 
                value={newAviso}
                onChange={(e) => setNewAviso(e.target.value)}
            />
            {/* Input de Data */}
            <input 
                type="date" 
                className="date-input-small"
                value={newAvisoDate}
                onChange={(e) => setNewAvisoDate(e.target.value)}
            />
            <button type="submit">Add</button>
        </form>
      </div>

      {/* 4. CALENDÁRIO (Integrado) */}
      <div className="dashboard-section calendar-section">
        <h3>Calendário</h3>
        <div className="calendar-wrapper">
            {/* Passamos a função tileContent aqui */}
            <Calendar 
                locale="pt-BR" 
                tileContent={tileContent}
            />
            <div className="calendar-legend">
                <span className="legend-item"><span className="dot task-dot"></span> Tarefa</span>
                <span className="legend-item"><span className="dot aviso-dot"></span> Aviso</span>
            </div>
        </div>
      </div>

    </div>
  );
}

export default DashboardPage;