'use client';

import { useState, useEffect, useRef } from 'react';
import { Corrida, VeiculoConfig } from '../types';
import { carregarDados as carregarDadosUtil, salvarDados as salvarDadosUtil, formatarData } from '../lib/utils';
import { FaDownload, FaUpload, FaCheck, FaExclamationTriangle, FaLifeRing } from 'react-icons/fa';
import Link from 'next/link';
import { verificarLogin } from '../lib/authUtils';
import RotaProtegida from '../components/RotaProtegida';

interface BackupData {
  corridas: Corrida[];
  veiculoConfig: VeiculoConfig | null;
  timestamp: number;
  versao: string;
  usuarioId?: string;
  usuarioEmail?: string;
}

const BackupPage = () => {
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [veiculoConfig, setVeiculoConfig] = useState<VeiculoConfig | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | 'aviso'; texto: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupFrequencia, setBackupFrequencia] = useState<string>('semanal');
  const [ultimoBackup, setUltimoBackup] = useState<number | null>(null);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [usuarioEmail, setUsuarioEmail] = useState<string | null>(null);
  const [usuarioNome, setUsuarioNome] = useState<string | null>(null);

  useEffect(() => {
    const { logado, sessao } = verificarLogin();
    if (logado && sessao) {
      setUsuarioId(sessao.id);
      setUsuarioEmail(sessao.email);
      setUsuarioNome(sessao.nome);
      console.log(`Usuário logado: ${sessao.nome} (${sessao.id})`);
    }
    
    carregarDadosUsuario();
    const ultimoBackupSalvo = localStorage.getItem('ultimoBackup');
    if (ultimoBackupSalvo) {
      setUltimoBackup(parseInt(ultimoBackupSalvo));
    }
    const frequenciaSalva = localStorage.getItem('backupFrequencia');
    if (frequenciaSalva) {
      setBackupFrequencia(frequenciaSalva);
    }
  }, []);

  const carregarDadosUsuario = () => {
    try {
      // Determinar a chave correta baseada no login
      const { logado, sessao } = verificarLogin();
      let chaveCorretas = 'corridas';
      
      if (logado && sessao) {
        chaveCorretas = `corridas_${sessao.id}`;
        console.log(`Usando chave de corridas específica do usuário: ${chaveCorretas}`);
      }
      
      // Carregar corridas
      const corridasSalvas = carregarDadosUtil<Corrida[]>(chaveCorretas, []);
      setCorridas(corridasSalvas);
      console.log(`Carregadas ${corridasSalvas.length} corridas de ${chaveCorretas}`);

      // Carregar configuração do veículo
      const configSalva = localStorage.getItem('veiculoConfig');
      if (configSalva) {
        const parsedConfig = JSON.parse(configSalva) as VeiculoConfig;
        setVeiculoConfig(parsedConfig);
      }
    } catch (erro) {
      console.error('Erro ao carregar dados:', erro);
      setMensagem({
        tipo: 'erro',
        texto: 'Erro ao carregar dados do localStorage.',
      });
    }
  };

  const exportarBackup = () => {
    try {
      // Criar objeto de backup
      const backupData: BackupData = {
        corridas: corridas,
        veiculoConfig: veiculoConfig,
        timestamp: Date.now(),
        versao: '1.0'
      };
      
      // Adicionar informações do usuário se estiver logado
      if (usuarioId && usuarioEmail) {
        backupData.usuarioId = usuarioId;
        backupData.usuarioEmail = usuarioEmail;
      }

      // Converter para string JSON
      const backupString = JSON.stringify(backupData, null, 2);

      // Criar blob e link para download
      const blob = new Blob([backupString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dataFormatada = new Date().toISOString().split('T')[0];
      const nomeArquivo = usuarioEmail
        ? `bruber_backup_${usuarioEmail.split('@')[0]}_${dataFormatada}.json`
        : `bruber_backup_${dataFormatada}.json`;
        
      a.href = url;
      a.download = nomeArquivo;
      document.body.appendChild(a);
      a.click();

      // Limpar
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Atualizar último backup
      const timestamp = Date.now();
      localStorage.setItem('ultimoBackup', timestamp.toString());
      setUltimoBackup(timestamp);

      setMensagem({
        tipo: 'sucesso',
        texto: 'Backup exportado com sucesso! Guarde este arquivo em um local seguro.',
      });
    } catch (erro) {
      console.error('Erro ao exportar backup:', erro);
      setMensagem({
        tipo: 'erro',
        texto: 'Erro ao exportar backup. Tente novamente.',
      });
    }
  };

  const importarBackup = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const arquivos = evento.target.files;
    if (!arquivos || arquivos.length === 0) {
      return;
    }

    const arquivo = arquivos[0];
    const leitor = new FileReader();

    leitor.onload = (e) => {
      try {
        if (!e.target || typeof e.target.result !== 'string') {
          throw new Error('Erro ao ler o arquivo');
        }

        const backupData = JSON.parse(e.target.result) as BackupData;

        // Validar formato do backup
        if (!backupData.corridas || !Array.isArray(backupData.corridas)) {
          throw new Error('Formato de backup inválido');
        }

        // Verificar se o backup pertence ao usuário logado
        if (usuarioId && backupData.usuarioId && backupData.usuarioId !== usuarioId) {
          setMensagem({
            tipo: 'aviso',
            texto: 'Este backup pertence a outro usuário. Deseja importá-lo mesmo assim?',
          });
          // Aqui poderia implementar uma confirmação, mas para simplificar vamos prosseguir
        }

        // Determinar a chave correta para salvar as corridas
        const chaveCorretas = usuarioId ? `corridas_${usuarioId}` : 'corridas';
        
        // Salvar as corridas do backup
        salvarDadosUtil(chaveCorretas, backupData.corridas);
        setCorridas(backupData.corridas);
        
        // Salvar cópia de segurança se estiver logado
        if (usuarioId) {
          salvarDadosUtil(`corridas_copia_seguranca_${usuarioId}`, backupData.corridas);
        }

        // Salvar a configuração do veículo, se existir
        if (backupData.veiculoConfig) {
          localStorage.setItem('veiculoConfig', JSON.stringify(backupData.veiculoConfig));
          setVeiculoConfig(backupData.veiculoConfig);
        }

        setMensagem({
          tipo: 'sucesso',
          texto: `Backup importado com sucesso! ${backupData.corridas.length} corridas restauradas.`,
        });
      } catch (erro) {
        console.error('Erro ao importar backup:', erro);
        setMensagem({
          tipo: 'erro',
          texto: 'Erro ao importar backup. Verifique se o arquivo está no formato correto.',
        });
      } finally {
        // Limpar o input de arquivo
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    leitor.onerror = () => {
      console.error('Erro ao ler o arquivo');
      setMensagem({
        tipo: 'erro',
        texto: 'Erro ao ler o arquivo. Tente novamente.',
      });
    };

    leitor.readAsText(arquivo);
  };

  const salvarFrequenciaBackup = () => {
    localStorage.setItem('backupFrequencia', backupFrequencia);
    setMensagem({
      tipo: 'sucesso',
      texto: `Lembrete de backup configurado para frequência ${backupFrequencia}.`,
    });
  };

  const formatarUltimoBackup = () => {
    if (!ultimoBackup) return 'Nunca';
    
    const data = new Date(ultimoBackup);
    return `${formatarData(data)} às ${data.getHours()}:${data.getMinutes().toString().padStart(2, '0')}`;
  };

  const deveExibirLembrete = () => {
    if (!ultimoBackup) return true;
    
    const agora = Date.now();
    const diffDias = Math.floor((agora - ultimoBackup) / (1000 * 60 * 60 * 24));
    
    switch (backupFrequencia) {
      case 'diario':
        return diffDias >= 1;
      case 'semanal':
        return diffDias >= 7;
      case 'mensal':
        return diffDias >= 30;
      default:
        return diffDias >= 7; // padrão: semanal
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Backup e Restauração</h1>
      
      {mensagem && (
        <div 
          className={`mb-6 p-4 rounded-lg ${
            mensagem.tipo === 'sucesso' 
              ? 'bg-green-100 border border-green-400 text-green-800' 
              : mensagem.tipo === 'erro'
                ? 'bg-red-100 border border-red-400 text-red-800'
                : 'bg-yellow-100 border border-yellow-400 text-yellow-800'
          }`}
        >
          <div className="flex items-center">
            {mensagem.tipo === 'sucesso' ? (
              <FaCheck className="mr-2" />
            ) : (
              <FaExclamationTriangle className="mr-2" />
            )}
            <span>{mensagem.texto}</span>
          </div>
        </div>
      )}
      
      {deveExibirLembrete() && corridas.length > 0 && (
        <div className="mb-6 p-4 rounded-lg bg-yellow-100 border border-yellow-400 text-yellow-800">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <span>
              {ultimoBackup 
                ? `Seu último backup foi em ${formatarUltimoBackup()}. É recomendado fazer um novo backup.` 
                : 'Você nunca fez um backup. É altamente recomendado fazer um backup dos seus dados.'}
            </span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Painel de Resumo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumo dos Dados</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-700">Corridas salvas:</span>
              <span className="font-medium text-gray-900">{corridas.length}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-700">Configuração do veículo:</span>
              <span className="font-medium text-gray-900">{veiculoConfig ? 'Configurado' : 'Não configurado'}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-700">Último backup:</span>
              <span className="font-medium text-gray-900">{formatarUltimoBackup()}</span>
            </div>
          </div>
        </div>
        
        {/* Recuperação de Emergência */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recuperação</h2>
          <p className="text-gray-700 mb-4">
            Se você perdeu suas corridas ou dados, tente usar nossa ferramenta de recuperação de emergência:
          </p>
          <Link 
            href="/recuperar" 
            className="inline-flex items-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg"
          >
            <FaLifeRing className="mr-2" /> Ferramenta de Recuperação
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Painel de Exportação */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Exportar Backup</h2>
          <p className="text-gray-700 mb-4">
            Exporte todos os seus dados para um arquivo JSON. Este arquivo conterá todas as suas corridas
            e configurações.
          </p>
          <button
            onClick={exportarBackup}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center"
          >
            <FaDownload className="mr-2" /> Exportar Backup
          </button>
        </div>
        
        {/* Painel de Importação */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Importar Backup</h2>
          <p className="text-gray-700 mb-4">
            Importe um arquivo de backup para restaurar seus dados. Isto substituirá todos os dados atuais.
          </p>
          <div className="flex items-center">
            <label className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 cursor-pointer flex items-center">
              <FaUpload className="mr-2" /> Selecionar Arquivo
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={importarBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
      
      {/* Configurações de Lembrete */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Lembretes de Backup</h2>
        <p className="text-gray-700 mb-4">
          Configure a frequência com que você deseja ser lembrado para fazer backup dos seus dados.
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <select
            value={backupFrequencia}
            onChange={(e) => setBackupFrequencia(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-black"
          >
            <option value="diario">Diário</option>
            <option value="semanal">Semanal</option>
            <option value="mensal">Mensal</option>
          </select>
          <button
            onClick={salvarFrequenciaBackup}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Salvar Preferência
          </button>
        </div>
      </div>
      
      {/* Instruções de Segurança */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recomendações de Segurança</h2>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Faça backups regularmente, especialmente após adicionar novas corridas.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Armazene seus arquivos de backup em um local seguro, como um serviço de nuvem (Google Drive, Dropbox) ou envie para seu e-mail.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Dados armazenados no navegador podem ser perdidos se você limpar o cache ou histórico do navegador, ou se trocar de navegador ou dispositivo.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>A função de backup permite que você mantenha seus dados seguros independentemente do navegador ou dispositivo que estiver usando.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BackupPage; 