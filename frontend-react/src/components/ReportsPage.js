import React, { useState, useEffect } from 'react';
// 1. Importando as ferramentas de gráfico
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './ReportsPage.css';

// 2. Registrando os módulos que o Chart.js usará
ChartJS.register(ArcElement, Tooltip, Legend);

function ReportsPage() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 3. useEffect para buscar os dados da API quando a página carregar
  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Autenticação inválida.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:5000/funcionarios/estatisticas', {
          headers: { 'x-access-token': token },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar dados de estatísticas.');
        }
        
        const data = await response.json();
        setStatsData(data); // Salva os dados no estado
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // Para de carregar, mesmo se der erro
      }
    };

    fetchStats();
  }, []); // O array vazio [] significa que isso roda apenas uma vez

  // 4. Lógica para formatar os dados para o gráfico (só depois que os dados chegarem)
  const getPieChartData = (dataObject, title) => {
    if (!dataObject) {
      return null;
    }

    const labels = Object.keys(dataObject);
    const data = Object.values(dataObject);

    return {
      labels: labels,
      datasets: [
        {
          label: title,
          data: data,
          backgroundColor: [
            'rgba(0, 123, 255, 0.8)',
            'rgba(23, 162, 184, 0.8)',
            'rgba(40, 167, 69, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(220, 53, 69, 0.8)',
          ],
          borderColor: [
            'rgba(0, 123, 255, 1)',
            'rgba(23, 162, 184, 1)',
            'rgba(40, 167, 69, 1)',
            'rgba(255, 193, 7, 1)',
            'rgba(220, 53, 69, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // 5. Lógica de renderização
  if (loading) {
    return <div>Carregando relatórios...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!statsData) {
    return <div>Não foi possível carregar os dados.</div>;
  }

  // Prepara os dados para cada gráfico
  const vinculoChartData = getPieChartData(statsData.por_vinculo, 'Tipo de Vínculo');
  const situacaoChartData = getPieChartData(statsData.por_situacao, 'Situação');

  return (
    <div className="reports-page">
      <h1>Relatórios</h1>
      
      <div className="stats-cards">
        <div className="stat-card">
          <h2>Total de Funcionários</h2>
          <p>{statsData.total_funcionarios}</p>
        </div>
      </div>

      <div className="charts-grid">
        {vinculoChartData && (
          <div className="chart-container">
            <h3>Divisão por Tipo de Vínculo</h3>
            <Pie data={vinculoChartData} />
          </div>
        )}
        {situacaoChartData && (
          <div className="chart-container">
            <h3>Divisão por Situação</h3>
            <Pie data={situacaoChartData} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;