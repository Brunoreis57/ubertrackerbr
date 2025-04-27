'use client';

import { ReactNode } from 'react';

interface CardProps {
  titulo: string;
  valor: string;
  icone: ReactNode;
  corFundo: string;
  corTexto: string;
}

const Card = ({
  titulo,
  valor,
  icone,
  corFundo,
  corTexto,
}: CardProps) => {
  // Usar fundo branco para todos os modos
  const bgColorClass = "bg-white";
  const textColorClass = "text-gray-900";
  
  return (
    <div className={`${bgColorClass} rounded-lg shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl border-2 border-gray-300`}>
      <div className="flex items-center mb-3 sm:mb-4">
        <div className={`${textColorClass} mr-2 sm:mr-3 text-xl sm:text-2xl`}>{icone}</div>
        <h3 className={`${textColorClass} font-bold text-base sm:text-lg`}>{titulo}</h3>
      </div>
      <div className={`${textColorClass} text-2xl sm:text-3xl font-bold break-words`} dangerouslySetInnerHTML={{ __html: valor }} />
    </div>
  );
};

export default Card; 