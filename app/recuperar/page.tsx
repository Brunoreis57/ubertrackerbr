'use client';

import { useState, useEffect } from 'react';
import { verificarLogin } from '../lib/authUtils';
import { Corrida } from '../types';
import { FaCheckCircle, FaExclamationTriangle, FaSearch, FaDownload, FaUserCheck } from 'react-icons/fa';

const RecuperarDadosPage = () => {
  const [backups, setBackups] = useState<{ chave: string; quantidade: number; dados: any[] }[]>([]);
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [corridasSelecionadas, setCorridasSelecionadas] = useState<Corrida[]>([]);
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [processando, setProcessando] = useState(false);
  const [restauracaoConcluida, setRestauracaoConcluida] = useState(false);
  
  useEffect(() => {
    buscarBackupsDisponiveis();
  }, []);
  
  const buscarBackupsDisponiveis = () => {
    try {
      setProcessando(true);
      setMensagem(null);
      const backupsEncontrados: { chave: string; quantidade: number; dados: any[] }[] = [];
      
      // Buscar todas as chaves no localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        if (!chave) continue;
        
        // Verificar se a chave está relacionada a corridas
        if (chave.includes('corrida') || chave === 'corridas') {
          try {
            const dadosString = localStorage.getItem(chave);
            if (dadosString) {
              const dados = JSON.parse(dadosString);
              if (Array.isArray(dados) && dados.length > 0) {
                backupsEncontrados.push({
                  chave,
                  quantidade: dados.length,
                  dados
                });
              }
            }
          } catch (erro) {
            console.error(`Erro ao ler dados da chave ${chave}:`, erro);
          }
        }
      }
      
      setBackups(backupsEncontrados);
      
      // Se encontrar algum backup, selecionar o maior (com mais corridas)
      if (backupsEncontrados.length > 0) {
        const maiorBackup = backupsEncontrados.reduce((prev, current) => 
          prev.quantidade > current.quantidade ? prev : current
        );
        
        setCorridas(maiorBackup.dados);
        setMensagem({ 
          tipo: 'sucesso', 
          texto: `Encontrados ${backupsEncontrados.length} backups. Backup com mais corridas: ${maiorBackup.chave} (${maiorBackup.quantidade} corridas)` 
        });
      } else {
        setMensagem({ 
          tipo: 'erro', 
          texto: 'Nenhum backup de corridas encontrado no armazenamento local.' 
        });
      }
    } catch (erro) {
      console.error('Erro ao buscar backups:', erro);
      setMensagem({ 
        tipo: 'erro', 
        texto: 'Erro ao buscar backups. Verifique o console para mais detalhes.' 
      });
    } finally {
      setProcessando(false);
    }
  };
  
  const selecionarCorridas = () => {
    setCorridasSelecionadas([...corridas]);
    setMensagem({ 
      tipo: 'sucesso', 
      texto: `${corridas.length} corridas selecionadas para restauração.` 
    });
  };
  
  const restaurarCorridasParaUsuario = async () => {
    if (!email.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Por favor, informe o email do usuário.' });
      return;
    }
    
    if (!corridasSelecionadas.length) {
      setMensagem({ tipo: 'erro', texto: 'Nenhuma corrida selecionada para restauração.' });
      return;
    }
    
    try {
      setProcessando(true);
      setMensagem(null);
      
      // Verificar se o usuário existe
      const usuariosString = localStorage.getItem('usuarios_cadastrados');
      if (!usuariosString) {
        setMensagem({ tipo: 'erro', texto: 'Nenhum usuário cadastrado encontrado.' });
        return;
      }
      
      const usuarios = JSON.parse(usuariosString);
      const usuarioEncontrado = usuarios.find((u: any) => 
        u.email.toLowerCase() === email.toLowerCase()
      );
      
      if (!usuarioEncontrado) {
        setMensagem({ 
          tipo: 'erro', 
          texto: `Usuário com email ${email} não encontrado. Verifique o email informado.` 
        });
        return;
      }
      
      // Simulação de atraso de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Buscar corridas atuais do usuário (se existirem)
      const chaveCorridasUsuario = `corridas_${usuarioEncontrado.id}`;
      const corridasAtuaisString = localStorage.getItem(chaveCorridasUsuario);
      let corridasAtuais: Corrida[] = [];
      
      if (corridasAtuaisString) {
        corridasAtuais = JSON.parse(corridasAtuaisString);
      }
      
      // Adicionar novas corridas, evitando duplicatas pelo ID
      const idsAtuais = new Set(corridasAtuais.map(c => c.id));
      const novasCorridas = [
        ...corridasAtuais,
        ...corridasSelecionadas.filter(c => !idsAtuais.has(c.id))
      ];
      
      // Salvar corridas atualizadas
      localStorage.setItem(chaveCorridasUsuario, JSON.stringify(novasCorridas));
      
      // Salvar cópia em corridas_copia_seguranca_[ID]
      localStorage.setItem(
        `corridas_copia_seguranca_${usuarioEncontrado.id}`, 
        JSON.stringify(novasCorridas)
      );
      
      setMensagem({ 
        tipo: 'sucesso', 
        texto: `${corridasSelecionadas.length} corridas restauradas com sucesso para o usuário ${usuarioEncontrado.nome}!` 
      });
      
      setRestauracaoConcluida(true);
    } catch (erro) {
      console.error('Erro ao restaurar corridas:', erro);
      setMensagem({ 
        tipo: 'erro', 
        texto: 'Erro ao restaurar corridas. Verifique o console para mais detalhes.' 
      });
    } finally {
      setProcessando(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Recuperação de Dados</h1>
      
      {mensagem && (
        <div 
          className={`mb-6 p-4 rounded-lg flex items-center ${
            mensagem.tipo === 'erro' 
              ? 'bg-red-100 text-red-800 border border-red-400' 
              : 'bg-green-100 text-green-800 border border-green-400'
          }`}
        >
          {mensagem.tipo === 'erro' 
            ? <FaExclamationTriangle className="mr-2" /> 
            : <FaCheckCircle className="mr-2" />
          }
          <span>{mensagem.texto}</span>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-gray-900 text-white p-4">
          <h2 className="text-xl font-bold flex items-center">
            <FaSearch className="mr-2" />
            Buscar Backups Disponíveis
          </h2>
        </div>
        
        <div className="p-6">
          <button 
            onClick={buscarBackupsDisponiveis}
            disabled={processando}
            className={`flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              processando 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gray-900 hover:bg-gray-800'
            }`}
          >
            {processando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Buscando...
              </>
            ) : (
              <>
                <FaSearch className="mr-2" />
                Buscar Backups
              </>
            )}
          </button>
          
          {backups.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Backups Encontrados:</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chave
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantidade
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {backups.map((backup, index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                          {backup.chave}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                          {backup.quantidade} corridas
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                          <button
                            onClick={() => {
                              setCorridas(backup.dados);
                              setMensagem({ 
                                tipo: 'sucesso', 
                                texto: `${backup.quantidade} corridas carregadas de ${backup.chave}` 
                              });
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Selecionar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {corridas.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gray-900 text-white p-4">
            <h2 className="text-xl font-bold flex items-center">
              <FaDownload className="mr-2" />
              Restaurar Corridas
            </h2>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                <strong>{corridas.length} corridas</strong> encontradas para restauração.
              </p>
              
              <button
                onClick={selecionarCorridas}
                disabled={processando}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Selecionar todas para restauração
              </button>
              
              <div className="mt-3 h-40 overflow-y-auto bg-gray-50 rounded p-3">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-1 text-left">ID</th>
                      <th className="px-2 py-1 text-left">Data</th>
                      <th className="px-2 py-1 text-left">Ganho Bruto</th>
                      <th className="px-2 py-1 text-left">KM Rodados</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {corridas.map((corrida, index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="px-2 py-1">{corrida.id.substring(0, 8)}...</td>
                        <td className="px-2 py-1">{new Date(corrida.data).toLocaleDateString()}</td>
                        <td className="px-2 py-1">R$ {corrida.ganhoBruto.toFixed(2)}</td>
                        <td className="px-2 py-1">{corrida.kmRodados} km</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <FaUserCheck className="mr-2" />
                Restaurar para Usuário
              </h3>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email do Usuário
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Informe o email do usuário"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={restaurarCorridasParaUsuario}
                  disabled={processando || corridasSelecionadas.length === 0 || !email.trim() || restauracaoConcluida}
                  className={`flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                    processando || corridasSelecionadas.length === 0 || !email.trim() || restauracaoConcluida
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {processando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Restaurando...
                    </>
                  ) : restauracaoConcluida ? (
                    <>
                      <FaCheckCircle className="mr-2" />
                      Restauração Concluída
                    </>
                  ) : (
                    <>
                      <FaDownload className="mr-2" />
                      Restaurar Corridas
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecuperarDadosPage; 