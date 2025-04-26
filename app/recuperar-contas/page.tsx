'use client';

import { useState, useEffect } from 'react';
import { Corrida } from '../types';
import { carregarDados, salvarDados } from '../lib/utils';
import { FaCheck, FaExclamationTriangle, FaSearch, FaSync, FaMagic } from 'react-icons/fa';
import { gerarId } from '../lib/utils';

const RecuperarContasPage = () => {
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | 'info'; texto: string } | null>(null);
  const [processando, setProcessando] = useState(false);
  const [email, setEmail] = useState('bruno.g.reis@gmail.com'); // Email pré-preenchido
  const [encontrado, setEncontrado] = useState(false);

  useEffect(() => {
    // Buscar todas as corridas disponíveis no localStorage
    buscarTodasAsCorridas();
  }, []);

  // Função que adiciona as corridas pré-definidas do Bruno
  const adicionarCorridasPredefinidas = async () => {
    try {
      setProcessando(true);
      setMensagem({ tipo: 'info', texto: 'Adicionando corridas predefinidas para Bruno...' });
      
      // Lista de corridas pré-definidas
      const corridasPredefinidas: Corrida[] = [
        { id: gerarId(), data: '2024-11-18', horasTrabalhadas: 9.0, kmRodados: 201.0, gastoGasolina: 132.66, quantidadeViagens: 19, ganhoBruto: 369.89 },
        { id: gerarId(), data: '2024-11-20', horasTrabalhadas: 4.0, kmRodados: 126.0, gastoGasolina: 83.16, quantidadeViagens: 10, ganhoBruto: 220.00 },
        { id: gerarId(), data: '2024-11-24', horasTrabalhadas: 5.0, kmRodados: 108.0, gastoGasolina: 71.28, quantidadeViagens: 12, ganhoBruto: 216.00 },
        { id: gerarId(), data: '2024-11-24', horasTrabalhadas: 9.0, kmRodados: 210.0, gastoGasolina: 138.60, quantidadeViagens: 18, ganhoBruto: 355.88 },
        { id: gerarId(), data: '2024-11-27', horasTrabalhadas: 6.0, kmRodados: 115.0, gastoGasolina: 75.90, quantidadeViagens: 14, ganhoBruto: 222.00 },
        { id: gerarId(), data: '2024-11-28', horasTrabalhadas: 6.0, kmRodados: 130.0, gastoGasolina: 85.80, quantidadeViagens: 15, ganhoBruto: 255.00 },
        { id: gerarId(), data: '2024-12-01', horasTrabalhadas: 6.0, kmRodados: 160.0, gastoGasolina: 105.60, quantidadeViagens: 13, ganhoBruto: 251.14 },
        { id: gerarId(), data: '2024-12-03', horasTrabalhadas: 6.0, kmRodados: 153.0, gastoGasolina: 100.98, quantidadeViagens: 12, ganhoBruto: 296.82 },
        { id: gerarId(), data: '2025-01-04', horasTrabalhadas: 6.0, kmRodados: 176.0, gastoGasolina: 116.16, quantidadeViagens: 16, ganhoBruto: 346.55 },
        { id: gerarId(), data: '2024-12-05', horasTrabalhadas: 5.0, kmRodados: 188.0, gastoGasolina: 124.08, quantidadeViagens: 12, ganhoBruto: 272.12 },
        { id: gerarId(), data: '2024-12-08', horasTrabalhadas: 6.0, kmRodados: 125.0, gastoGasolina: 82.50, quantidadeViagens: 16, ganhoBruto: 303.66 },
        { id: gerarId(), data: '2024-12-09', horasTrabalhadas: 8.0, kmRodados: 238.0, gastoGasolina: 157.08, quantidadeViagens: 24, ganhoBruto: 391.36 },
        { id: gerarId(), data: '2024-12-10', horasTrabalhadas: 7.0, kmRodados: 172.0, gastoGasolina: 113.52, quantidadeViagens: 21, ganhoBruto: 380.97 },
        { id: gerarId(), data: '2024-12-11', horasTrabalhadas: 7.0, kmRodados: 198.0, gastoGasolina: 130.68, quantidadeViagens: 21, ganhoBruto: 435.62 },
        { id: gerarId(), data: '2025-01-17', horasTrabalhadas: 8.0, kmRodados: 218.0, gastoGasolina: 143.88, quantidadeViagens: 14, ganhoBruto: 447.23 },
        { id: gerarId(), data: '2024-12-18', horasTrabalhadas: 8.0, kmRodados: 178.0, gastoGasolina: 117.48, quantidadeViagens: 17, ganhoBruto: 471.62 },
        { id: gerarId(), data: '2024-12-19', horasTrabalhadas: 6.0, kmRodados: 171.0, gastoGasolina: 112.86, quantidadeViagens: 16, ganhoBruto: 478.80 },
        { id: gerarId(), data: '2024-12-22', horasTrabalhadas: 3.0, kmRodados: 90.0, gastoGasolina: 59.40, quantidadeViagens: 8, ganhoBruto: 133.89 },
        { id: gerarId(), data: '2024-12-25', horasTrabalhadas: 2.0, kmRodados: 40.0, gastoGasolina: 26.40, quantidadeViagens: 3, ganhoBruto: 89.42 },
        { id: gerarId(), data: '2024-12-26', horasTrabalhadas: 4.0, kmRodados: 110.0, gastoGasolina: 72.60, quantidadeViagens: 12, ganhoBruto: 178.00 },
        { id: gerarId(), data: '2024-12-29', horasTrabalhadas: 4.0, kmRodados: 120.0, gastoGasolina: 79.20, quantidadeViagens: 12, ganhoBruto: 208.54 },
        { id: gerarId(), data: '2025-01-07', horasTrabalhadas: 3.0, kmRodados: 80.0, gastoGasolina: 52.80, quantidadeViagens: 9, ganhoBruto: 122.42 },
        { id: gerarId(), data: '2025-01-19', horasTrabalhadas: 7.0, kmRodados: 190.0, gastoGasolina: 125.40, quantidadeViagens: 15, ganhoBruto: 283.12 },
        { id: gerarId(), data: '2025-01-20', horasTrabalhadas: 6.0, kmRodados: 175.0, gastoGasolina: 115.50, quantidadeViagens: 18, ganhoBruto: 294.86 },
        { id: gerarId(), data: '2025-01-21', horasTrabalhadas: 1.0, kmRodados: 12.0, gastoGasolina: 7.92, quantidadeViagens: 1, ganhoBruto: 19.73 },
        { id: gerarId(), data: '2025-01-22', horasTrabalhadas: 9.0, kmRodados: 280.0, gastoGasolina: 184.80, quantidadeViagens: 20, ganhoBruto: 438.86 },
        { id: gerarId(), data: '2025-01-26', horasTrabalhadas: 2.0, kmRodados: 89.0, gastoGasolina: 58.74, quantidadeViagens: 5, ganhoBruto: 152.79 },
        { id: gerarId(), data: '2025-01-28', horasTrabalhadas: 4.0, kmRodados: 100.0, gastoGasolina: 66.00, quantidadeViagens: 9, ganhoBruto: 164.09 },
        { id: gerarId(), data: '2025-01-29', horasTrabalhadas: 2.0, kmRodados: 65.0, gastoGasolina: 42.90, quantidadeViagens: 6, ganhoBruto: 83.50 },
        { id: gerarId(), data: '2025-02-02', horasTrabalhadas: 7.0, kmRodados: 200.0, gastoGasolina: 132.00, quantidadeViagens: 15, ganhoBruto: 247.64 },
        { id: gerarId(), data: '2025-02-06', horasTrabalhadas: 4.0, kmRodados: 145.0, gastoGasolina: 95.70, quantidadeViagens: 11, ganhoBruto: 209.77 },
        { id: gerarId(), data: '2025-02-09', horasTrabalhadas: 10.0, kmRodados: 286.0, gastoGasolina: 188.76, quantidadeViagens: 17, ganhoBruto: 618.34 },
        { id: gerarId(), data: '2025-02-10', horasTrabalhadas: 6.0, kmRodados: 170.0, gastoGasolina: 112.20, quantidadeViagens: 13, ganhoBruto: 293.55 },
        { id: gerarId(), data: '2025-02-11', horasTrabalhadas: 9.0, kmRodados: 210.0, gastoGasolina: 138.60, quantidadeViagens: 22, ganhoBruto: 364.75 },
        { id: gerarId(), data: '2025-02-12', horasTrabalhadas: 3.0, kmRodados: 106.0, gastoGasolina: 69.96, quantidadeViagens: 4, ganhoBruto: 98.67 },
        { id: gerarId(), data: '2025-02-13', horasTrabalhadas: 9.0, kmRodados: 205.0, gastoGasolina: 135.30, quantidadeViagens: 21, ganhoBruto: 369.50 },
        { id: gerarId(), data: '2025-02-16', horasTrabalhadas: 6.0, kmRodados: 190.0, gastoGasolina: 125.40, quantidadeViagens: 13, ganhoBruto: 307.80 },
        { id: gerarId(), data: '2025-02-17', horasTrabalhadas: 3.0, kmRodados: 80.0, gastoGasolina: 52.80, quantidadeViagens: 7, ganhoBruto: 92.88 },
        { id: gerarId(), data: '2025-02-18', horasTrabalhadas: 7.0, kmRodados: 283.0, gastoGasolina: 186.78, quantidadeViagens: 14, ganhoBruto: 336.84 },
        { id: gerarId(), data: '2025-02-20', horasTrabalhadas: 12.0, kmRodados: 405.0, gastoGasolina: 267.30, quantidadeViagens: 31, ganhoBruto: 504.06 },
        { id: gerarId(), data: '2025-02-23', horasTrabalhadas: 6.0, kmRodados: 200.0, gastoGasolina: 132.00, quantidadeViagens: 12, ganhoBruto: 224.95 },
        { id: gerarId(), data: '2025-02-24', horasTrabalhadas: 6.0, kmRodados: 165.0, gastoGasolina: 108.90, quantidadeViagens: 12, ganhoBruto: 217.00 },
        { id: gerarId(), data: '2025-02-25', horasTrabalhadas: 1.0, kmRodados: 35.0, gastoGasolina: 23.10, quantidadeViagens: 5, ganhoBruto: 52.06 },
        { id: gerarId(), data: '2025-03-10', horasTrabalhadas: 3.0, kmRodados: 60.0, gastoGasolina: 39.60, quantidadeViagens: 7, ganhoBruto: 120.73 },
        { id: gerarId(), data: '2025-03-11', horasTrabalhadas: 8.0, kmRodados: 250.0, gastoGasolina: 165.00, quantidadeViagens: 18, ganhoBruto: 376.65 },
        { id: gerarId(), data: '2025-03-12', horasTrabalhadas: 3.0, kmRodados: 93.0, gastoGasolina: 61.38, quantidadeViagens: 6, ganhoBruto: 115.00 },
        { id: gerarId(), data: '2025-03-13', horasTrabalhadas: 2.0, kmRodados: 35.0, gastoGasolina: 23.10, quantidadeViagens: 3, ganhoBruto: 63.80 }
      ];
      
      setCorridas(corridasPredefinidas);
      
      // Verificar se o usuário Bruno existe
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
          texto: `Usuário com email ${email} não encontrado. Verifique o email.` 
        });
        return;
      }
      
      // Simulação de atraso de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Salvar diretamente nas chaves do usuário
      const chaveCorridasUsuario = `corridas_${usuarioEncontrado.id}`;
      
      // Verificar se já existem corridas para este usuário
      const corridasExistentesString = localStorage.getItem(chaveCorridasUsuario);
      let corridasExistentes: Corrida[] = [];
      
      if (corridasExistentesString) {
        corridasExistentes = JSON.parse(corridasExistentesString);
      }
      
      // Combinar corridas existentes com as novas predefinidas, evitando duplicatas
      const idsExistentes = new Set(corridasExistentes.map(c => c.id));
      
      // Se as corridas já existem, não adicione novamente
      if (corridasExistentes.length > 40) {
        setMensagem({ 
          tipo: 'info', 
          texto: `${usuarioEncontrado.nome} já possui ${corridasExistentes.length} corridas. Não precisamos adicionar mais.` 
        });
        setProcessando(false);
        return;
      }
      
      // Adicionar as corridas predefinidas
      const todasCorridas = [...corridasExistentes, ...corridasPredefinidas];
      
      // Salvar corridas completas
      salvarDados(chaveCorridasUsuario, todasCorridas);
      
      // Salvar também uma cópia de segurança
      salvarDados(`corridas_copia_seguranca_${usuarioEncontrado.id}`, todasCorridas);
      
      setMensagem({ 
        tipo: 'sucesso', 
        texto: `${corridasPredefinidas.length} corridas adicionadas com sucesso para ${usuarioEncontrado.nome}!` 
      });
      
      setEncontrado(true);
    } catch (erro) {
      console.error('Erro ao adicionar corridas predefinidas:', erro);
      setMensagem({ 
        tipo: 'erro', 
        texto: 'Ocorreu um erro ao adicionar as corridas predefinidas.' 
      });
    } finally {
      setProcessando(false);
    }
  };

  const buscarTodasAsCorridas = () => {
    try {
      setProcessando(true);
      setMensagem({ tipo: 'info', texto: 'Buscando corridas antigas...' });

      // Array para armazenar todas as chaves relacionadas a corridas
      const todasCorridas: Corrida[] = [];
      
      // Verificar todas as chaves do localStorage
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
                // Adicionar apenas corridas não duplicadas pelo ID
                dados.forEach((corrida: Corrida) => {
                  if (!todasCorridas.some(c => c.id === corrida.id)) {
                    todasCorridas.push(corrida);
                  }
                });
                
                console.log(`Encontradas ${dados.length} corridas na chave: ${chave}`);
              }
            }
          } catch (erro) {
            console.error(`Erro ao ler dados da chave ${chave}:`, erro);
          }
        }
      }
      
      // Ordenar corridas por data (mais recentes primeiro)
      todasCorridas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      
      setCorridas(todasCorridas);
      
      setMensagem({ 
        tipo: 'info', 
        texto: `Encontradas ${todasCorridas.length} corridas no total.` 
      });
      
      if (todasCorridas.length > 0) {
        setEncontrado(true);
      }
    } catch (erro) {
      console.error('Erro ao buscar corridas:', erro);
      setMensagem({ 
        tipo: 'erro', 
        texto: 'Ocorreu um erro ao buscar as corridas.' 
      });
    } finally {
      setProcessando(false);
    }
  };

  const selecionarCorridas = () => {
    // ... existing code ...
  };

  const restaurarParaUsuario = async () => {
    if (!email) {
      setMensagem({ tipo: 'erro', texto: 'Por favor, informe o email do usuário.' });
      return;
    }
    
    try {
      setProcessando(true);
      setMensagem({ tipo: 'info', texto: 'Verificando usuário...' });

      // Verificar se o usuário existe
      const usuariosString = localStorage.getItem('usuarios_cadastrados');
      if (!usuariosString) {
        setMensagem({ tipo: 'erro', texto: 'Nenhum usuário cadastrado encontrado.' });
        return;
      }
      
      const usuarios = JSON.parse(usuariosString);
      const usuarioEncontrado = usuarios.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      
      if (!usuarioEncontrado) {
        setMensagem({ 
          tipo: 'erro', 
          texto: `Usuário com email ${email} não encontrado. Verifique o email.` 
        });
        return;
      }
      
      // Simulação de atraso de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Chave específica para salvar as corridas do usuário
      const chaveCorridasUsuario = `corridas_${usuarioEncontrado.id}`;
      
      // Verificar se já existem corridas para este usuário
      const corridasExistentesString = localStorage.getItem(chaveCorridasUsuario);
      const corridasExistentes = corridasExistentesString ? JSON.parse(corridasExistentesString) : [];
      
      // Se já existem corridas, combinar com as encontradas evitando duplicações
      const idsExistentes = new Set(corridasExistentes.map((c: Corrida) => c.id));
      
      // Adicionar apenas corridas que não existem
      const corridasNovas = corridas.filter(c => !idsExistentes.has(c.id));
      
      // Combinar corridas existentes com as novas
      const todasCorridas = [...corridasExistentes, ...corridasNovas];
      
      // Salvar corridas completas
      salvarDados(chaveCorridasUsuario, todasCorridas);
      
      // Salvar também uma cópia de segurança
      salvarDados(`corridas_copia_seguranca_${usuarioEncontrado.id}`, todasCorridas);
      
      setMensagem({ 
        tipo: 'sucesso', 
        texto: `${corridasNovas.length} corridas restauradas para ${usuarioEncontrado.nome}! Total: ${todasCorridas.length} corridas.` 
      });
    } catch (erro) {
      console.error('Erro ao restaurar corridas:', erro);
      setMensagem({ 
        tipo: 'erro', 
        texto: 'Ocorreu um erro ao restaurar as corridas.' 
      });
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Restauração de Dados para Usuário</h1>
      
      {mensagem && (
        <div 
          className={`mb-6 p-4 rounded-lg flex items-center ${
            mensagem.tipo === 'erro' 
              ? 'bg-red-100 text-red-800 border border-red-400' 
              : mensagem.tipo === 'sucesso'
                ? 'bg-green-100 text-green-800 border border-green-400'
                : 'bg-blue-100 text-blue-800 border border-blue-400'
          }`}
        >
          {mensagem.tipo === 'erro' 
            ? <FaExclamationTriangle className="mr-2" /> 
            : mensagem.tipo === 'sucesso'
              ? <FaCheck className="mr-2" />
              : <FaSearch className="mr-2" />
          }
          <span>{mensagem.texto}</span>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-gray-900 text-white p-4">
          <h2 className="text-xl font-bold flex items-center">
            <FaMagic className="mr-2" />
            Adicionar Corridas Predefinidas para Bruno
          </h2>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Clique no botão abaixo para adicionar automaticamente as corridas históricas para o usuário Bruno (email: bruno.g.reis@gmail.com).
          </p>
          
          <button 
            onClick={adicionarCorridasPredefinidas}
            disabled={processando}
            className={`flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              processando 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {processando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adicionando...
              </>
            ) : (
              <>
                <FaMagic className="mr-2" />
                Adicionar Corridas do Bruno
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-gray-900 text-white p-4">
          <h2 className="text-xl font-bold flex items-center">
            <FaSearch className="mr-2" />
            Buscar Corridas Antigas
          </h2>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Esta ferramenta busca todas as corridas salvas no navegador e permite restaurá-las para um usuário específico.
          </p>
          
          <button 
            onClick={buscarTodasAsCorridas}
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
                Buscar Corridas
              </>
            )}
          </button>
          
          {corridas.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {corridas.length} corridas encontradas
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-1 text-left">Data</th>
                      <th className="px-2 py-1 text-left">Ganho Bruto</th>
                      <th className="px-2 py-1 text-left">KM Rodados</th>
                      <th className="px-2 py-1 text-left">Horas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {corridas.slice(0, 15).map((corrida, index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="px-2 py-1">{new Date(corrida.data).toLocaleDateString()}</td>
                        <td className="px-2 py-1">R$ {corrida.ganhoBruto.toFixed(2)}</td>
                        <td className="px-2 py-1">{corrida.kmRodados} km</td>
                        <td className="px-2 py-1">{corrida.horasTrabalhadas}h</td>
                      </tr>
                    ))}
                    {corridas.length > 15 && (
                      <tr>
                        <td colSpan={4} className="px-2 py-1 text-center text-gray-500">
                          Mostrando 15 de {corridas.length} corridas...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {encontrado && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-900 text-white p-4">
            <h2 className="text-xl font-bold flex items-center">
              <FaSync className="mr-2" />
              Restaurar para o Usuário
            </h2>
          </div>
          
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Informe o email do usuário para o qual deseja restaurar as corridas:
            </p>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email do Usuário
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={restaurarParaUsuario}
                disabled={processando || !email.trim() || !corridas.length}
                className={`flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                  processando || !email.trim() || !corridas.length
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {processando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Restaurando...
                  </>
                ) : (
                  <>
                    <FaSync className="mr-2" />
                    Restaurar Corridas
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecuperarContasPage; 