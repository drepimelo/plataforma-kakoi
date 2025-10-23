import React, { useState, useEffect } from 'react';
// 1. Importando as ferramentas de gráfico
import { Pie } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import {Chart as ChartJS,CategoryScale,LinearScale,BarElement,Tooltip,Legend, ArcElement} from 'chart.js';
import './ReportsPage.css';

// 2. Registrando os módulos que o Chart.js usará
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

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
const createChartData = (dataObject, chartType = 'bar') => {
    if (!dataObject) {
      return null;
    }
    
    const labels = Object.keys(dataObject);
    const data = Object.values(dataObject);
    const dataset = {
      label: 'Quantidade',
      data: data,
      backgroundColor: [
        'rgba(0, 123, 255, 0.8)',
        'rgba(23, 162, 184, 0.8)',
        'rgba(40, 167, 69, 0.8)',
        'rgba(255, 193, 7, 0.8)',
        'rgba(220, 53, 69, 0.8)',
      ],
      borderWidth: 1,
    };
    if (chartType === 'bar') {
      dataset.borderRadius = 36; 
    }

    return {
      labels: labels,
      datasets: [dataset], // Use o dataset que acabamos de montar
    };
  };

  // --- Placeholder para o botão de download ---
  const handleDownloadExcel = () => {
    alert('Funcionalidade de download do Excel ainda não implementada.');
  };

  if (loading) return <div>Carregando relatórios...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!statsData) return <div>Não foi possível carregar os dados.</div>;





  
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
const vinculoChartData = createChartData(statsData.por_vinculo);
  const vinculoOptions = {
    indexAxis: 'y', // Isso torna o gráfico horizontal
    responsive: true,
    plugins: {
      legend: {
        display: false, // Esconde a legenda, como no design
        
      },
      title: {
        display: true,
        text: 'Tipo de Vínculo', // Título do gráfico
        font: { size: 16 }
      },
    },
    scales: {
      y: { // O eixo Y (onde ficam os números 0, 10, 20...)
        ticks: {
          font: {
            size: 12,
            family: 'DM Sans',
          }
        },
        grid: {
          color: '#f0f0f0', // Cor das linhas de grade (cinza bem claro),
          
        }
      },
      x: { // O eixo X (onde ficam os nomes "Ativo", "Inativo"...)
        ticks: {
          font: {
            size: 14,
            family: 'DM Sans',
          },
        },
        grid: {
          display: false // Esconde as linhas de grade verticais
        }
      }
    }
  };
 const situacaoChartData = createChartData(statsData.por_situacao);
  const situacaoOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Esconde a legenda
        font: { family: 'DM Sans' },
      },
      title: {
        display: true,
        text: 'Funcionários Ativos/Inativos', // Título do gráfico
        font: { size: 16, family: 'DM Sans' },
      },
    },
    scales: {
      y: { // O eixo Y (onde ficam os números 0, 10, 20...)
        ticks: {
          color: '#555', // Cor da fonte dos números (um cinza escuro)
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: '#f0f0f0' // Cor das linhas de grade (cinza bem claro)
        },
      },
      x: { // O eixo X (onde ficam os nomes "Ativo", "Inativo"...)
        ticks: {
          color: '#333', // Cor da fonte dos rótulos (preto suave)
          font: {
            size: 14
          }
        },
        
        grid: {
          display: false // Esconde as linhas de grade verticais
        }
      }
    }
  };

  return (
    <div className="reports-page">
      <h1>Relatórios</h1>
    
        <div className="reports-wrapper">
            <div className="stats-cards">
                <div className="stat-card">
                    <h2>Total de Funcionários</h2>
                    <p>{statsData.total_funcionarios}</p>
                </div>
                <div className="stat-card">
                    <h2>Tempo Médio de Serviço</h2>
                    {/* Adiciona "anos" ao dado que vem do backend */}
                    <p>{statsData.tempo_medio_servico_anos} anos</p>
                </div>
            </div>

            <div className="charts-grid">
                {vinculoChartData && (
                <div className="chart-container">
                    <h3>Divisão por Tipo de Vínculo</h3>
                    <Bar options={vinculoOptions} data={vinculoChartData} />
                </div>
                )}
                {situacaoChartData && (
                <div className="chart-container">
                    <h3>Divisão por Situação</h3>
                    <Pie data={situacaoChartData} />
                </div>
                )}
            </div>
            <div className="report-actions">
                <button onClick={handleDownloadExcel} className="download-button">
                Baixar Relatórios (Excel)
                </button>
            </div>
      </div>
    </div>
  );
}

export default ReportsPage;