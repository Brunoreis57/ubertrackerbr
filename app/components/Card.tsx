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
  corFundo = '',
  corTexto = '',
}: CardProps) => {
  // Classes base para o card
  const cardClasses = `
    bg-white dark:bg-gray-800 
    rounded-lg shadow-lg 
    p-4 sm:p-6 
    transition-all duration-300 
    hover:shadow-xl 
    border border-gray-200 dark:border-gray-700
    ${corFundo}
  `.trim();

  // Classes para o título
  const tituloClasses = `
    text-gray-900 dark:text-white 
    font-bold text-base sm:text-lg
    ${corTexto}
  `.trim();

  // Classes para o valor
  const valorClasses = `
    text-gray-900 dark:text-white 
    text-2xl sm:text-3xl font-bold break-words
    ${corTexto}
  `.trim();

  // Classes para o ícone
  const iconeClasses = `
    text-gray-700 dark:text-gray-200 
    mr-2 sm:mr-3 text-xl sm:text-2xl
    ${corTexto}
  `.trim();

  return (
    <div className={cardClasses}>
      <div className="flex items-center mb-3 sm:mb-4">
        <div className={iconeClasses}>{icone}</div>
        <h3 className={tituloClasses}>{titulo}</h3>
      </div>
      <div 
        className={valorClasses} 
        dangerouslySetInnerHTML={{ __html: valor }} 
      />
    </div>
  );
};

export default Card; 