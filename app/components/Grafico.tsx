'use client';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { DadosGrafico } from '../types';
import { useEffect, useState } from 'react';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface GraficoProps {
  tipo: 'linha' | 'barra' | 'pizza';
  dados: DadosGrafico;
  titulo: string;
  altura?: number;
}

const Grafico = ({ tipo, dados, titulo, altura = 300 }: GraficoProps) => {
  const [alturaResponsiva, setAlturaResponsiva] = useState(altura);
  
  // Ajustar altura com base no tamanho da tela
  useEffect(() => {
    const ajustarAltura = () => {
      if (window.innerWidth < 640) { // Telas pequenas (mobile)
        setAlturaResponsiva(Math.max(250, altura - 50));
      } else {
        setAlturaResponsiva(altura);
      }
    };
    
    // Ajustar na montagem do componente
    ajustarAltura();
    
    // Ajustar quando a janela for redimensionada
    window.addEventListener('resize', ajustarAltura);
    
    // Limpar listener quando o componente for desmontado
    return () => window.removeEventListener('resize', ajustarAltura);
  }, [altura]);

  const opcoes = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: window?.innerWidth < 640 ? 10 : 12,
          }
        }
      },
      title: {
        display: true,
        text: titulo,
        font: {
          size: window?.innerWidth < 640 ? 14 : 16,
        },
        padding: {
          top: 10,
          bottom: 10
        }
      },
      tooltip: {
        bodyFont: {
          size: window?.innerWidth < 640 ? 10 : 12,
        },
        titleFont: {
          size: window?.innerWidth < 640 ? 12 : 14,
        }
      }
    },
  };

  return (
    <div style={{ height: alturaResponsiva }} className="w-full p-2">
      {tipo === 'linha' && <Line data={dados} options={opcoes} />}
      {tipo === 'barra' && <Bar data={dados} options={opcoes} />}
      {tipo === 'pizza' && <Pie data={dados} options={opcoes} />}
    </div>
  );
};

export default Grafico; 