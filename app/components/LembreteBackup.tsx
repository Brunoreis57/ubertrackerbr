'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaDatabase, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const LembreteBackup = () => {
  const [mostrarLembrete, setMostrarLembrete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    verificarNecessidadeBackup();
  }, []);

  const verificarNecessidadeBackup = () => {
    try {
      // Verificar se os lembretes estão ativados
      const backupAutomatico = localStorage.getItem('backupAutomatico');
      if (backupAutomatico !== 'true') {
        return;
      }

      // Verificar se há dados para fazer backup
      const corridasString = localStorage.getItem('corridas');
      if (!corridasString || corridasString === '[]') {
        return;
      }

      // Verificar quando foi o último backup
      const ultimoBackupData = localStorage.getItem('ultimoBackupData');
      if (!ultimoBackupData) {
        // Nunca fez backup
        setMostrarLembrete(true);
        return;
      }

      // Verificar o intervalo configurado
      const intervaloBackup = localStorage.getItem('intervaloBackup');
      const intervalo = intervaloBackup ? parseInt(intervaloBackup, 10) : 7; // Padrão: 7 dias

      // Verificar se já passou o tempo desde o último backup
      // Esta é uma implementação simplificada. Na vida real, você iria analisar a data do último backup.
      const ultimoLembreteVisto = localStorage.getItem('ultimoLembreteVisto');
      if (!ultimoLembreteVisto) {
        setMostrarLembrete(true);
        return;
      }

      const ultimoLembreteTimestamp = parseInt(ultimoLembreteVisto, 10);
      const agora = new Date().getTime();
      const diferenca = agora - ultimoLembreteTimestamp;
      const diasDiferenca = diferenca / (1000 * 60 * 60 * 24);

      if (diasDiferenca >= intervalo) {
        setMostrarLembrete(true);
      }
    } catch (erro) {
      console.error('Erro ao verificar necessidade de backup:', erro);
    }
  };

  const fecharLembrete = () => {
    localStorage.setItem('ultimoLembreteVisto', new Date().getTime().toString());
    setMostrarLembrete(false);
  };

  const irParaBackup = () => {
    router.push('/backup');
  };

  if (!mostrarLembrete) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center text-yellow-800 font-medium">
            <FaExclamationTriangle className="mr-2" />
            <span>Lembrete de Backup</span>
          </div>
          <button 
            onClick={fecharLembrete}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FaTimes />
          </button>
        </div>
        <p className="text-sm text-yellow-800 mb-3">
          É recomendado fazer backup dos seus dados regularmente para evitar perdas.
          Seu último backup pode estar desatualizado.
        </p>
        <div className="flex justify-end">
          <button
            onClick={irParaBackup}
            className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm flex items-center"
          >
            <FaDatabase className="mr-1.5" size={12} />
            Fazer Backup Agora
          </button>
        </div>
      </div>
    </div>
  );
};

export default LembreteBackup; 