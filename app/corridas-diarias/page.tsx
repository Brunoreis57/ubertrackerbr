'use client';

import { useState, useEffect } from 'react';
import TabelaCorridas from '../components/TabelaCorridas';
import FormularioCorrida from '../components/FormularioCorrida';
import { Corrida } from '../types';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { carregarDados, salvarDados } from '../lib/utils';
import { verificarLogin } from '../lib/authUtils';

const CorridasDiarias = () => {
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [corridaParaEditar, setCorridaParaEditar] = useState<Corrida | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);

  useEffect(() => {
    carregarCorridasDoStorage();
  }, []);

  const carregarCorridasDoStorage = () => {
    try {
      // Verificar se o usuário está logado
      const { logado, sessao } = verificarLogin();
      let chaveCorretas = 'corridas';
      
      if (logado && sessao) {
        setUsuarioId(sessao.id);
        chaveCorretas = `corridas_${sessao.id}`;
        console.log(`Usuário logado: ${sessao.nome} (${sessao.id}). Usando chave: ${chaveCorretas}`);
      } else {
        console.log('Usuário não logado. Usando chave padrão: corridas');
      }
      
      // Usar a função utilitária para carregar dados
      const corridasCarregadas = carregarDados<Corrida[]>(chaveCorretas, []);
      console.log(`Corridas carregadas (${chaveCorretas}):`, corridasCarregadas.length);
      
      // Debug: mostrar informações detalhadas sobre as corridas carregadas
      if (corridasCarregadas.length > 0) {
        console.log('Últimas 3 corridas carregadas:');
        const ultimasCorridas = corridasCarregadas.slice(-3);
        ultimasCorridas.forEach((corrida, index) => {
          console.log(`Corrida ${index + 1}:`, {
            id: corrida.id,
            data: corrida.data,
            dataFormatada: typeof corrida.data === 'string' ? new Date(corrida.data).toLocaleDateString('pt-BR') : 'Data inválida',
            horasTrabalhadas: corrida.horasTrabalhadas,
            kmRodados: corrida.kmRodados,
            ganhoBruto: corrida.ganhoBruto
          });
        });
      }
      
      // Validar dados carregados
      if (Array.isArray(corridasCarregadas)) {
        // Ordenar corridas por data (mais recente primeiro)
        // Como estamos usando formato YYYY-MM-DD, podemos ordenar diretamente as strings
        const corridasOrdenadas = [...corridasCarregadas].sort((a, b) => {
          // Extrair apenas a parte da data se estiver em formato ISO
          const dataA = a.data.includes('T') ? a.data.split('T')[0] : a.data;
          const dataB = b.data.includes('T') ? b.data.split('T')[0] : b.data;
          
          // Ordenar de forma decrescente (mais recente primeiro)
          return dataB.localeCompare(dataA);
        });
        
        console.log('Corridas ordenadas por data (mais recente primeiro)');
        setCorridas(corridasOrdenadas);
      } else {
        console.error('Dados carregados não são um array:', corridasCarregadas);
        setCorridas([]);
        // Se houver um usuário logado, salvar na chave específica dele
        salvarDados(chaveCorretas, []);
      }
    } catch (erro) {
      console.error('Erro ao carregar dados:', erro);
      setCorridas([]);
      exibirMensagem('Erro ao carregar dados.', 'erro');
    }
  };

  const salvarCorrida = (novaCorrida: Corrida) => {
    try {
      console.log('Salvando corrida:', novaCorrida);
      
      // Determinar a chave correta baseada no login
      const chaveArmazenamento = usuarioId ? `corridas_${usuarioId}` : 'corridas';
      console.log(`Usando chave de armazenamento: ${chaveArmazenamento}`);
      
      // Obter as corridas atualizadas diretamente do localStorage
      const corridasAtuais = carregarDados<Corrida[]>(chaveArmazenamento, []);
      let novasCorridas: Corrida[];
      
      if (corridaParaEditar) {
        // Atualizar corrida existente
        novasCorridas = corridasAtuais.map((corrida) =>
          corrida.id === corridaParaEditar.id ? novaCorrida : corrida
        );
        exibirMensagem('Corrida atualizada com sucesso!', 'sucesso');
      } else {
        // Adicionar nova corrida
        novasCorridas = [...corridasAtuais, novaCorrida];
        exibirMensagem('Corrida adicionada com sucesso!', 'sucesso');
      }
      
      console.log('Lista atualizada de corridas:', novasCorridas.length);
      
      // Salvar no localStorage usando a função utilitária
      salvarDados(chaveArmazenamento, novasCorridas);
      
      // Se o usuário estiver logado, também salvar uma cópia de segurança
      if (usuarioId) {
        salvarDados(`corridas_copia_seguranca_${usuarioId}`, novasCorridas);
      }
      
      setCorridas(novasCorridas);
      setCorridaParaEditar(null);
      setMostrarFormulario(false);
      
      // Rolar para o topo da tabela após adicionar/editar
      setTimeout(() => {
        const tabelaElement = document.getElementById('tabela-corridas');
        if (tabelaElement) {
          tabelaElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (erro) {
      console.error('Erro ao salvar corrida:', erro);
      exibirMensagem('Erro ao salvar corrida. Tente novamente.', 'erro');
    }
  };

  const editarCorrida = (corrida: Corrida) => {
    console.log('Editando corrida:', corrida);
    setCorridaParaEditar(corrida);
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const excluirCorrida = (id: string) => {
    try {
      console.log('Excluindo corrida com ID:', id);
      
      // Determinar a chave correta baseada no login
      const chaveArmazenamento = usuarioId ? `corridas_${usuarioId}` : 'corridas';
      
      // Obter as corridas atualizadas diretamente do localStorage
      const corridasAtuais = carregarDados<Corrida[]>(chaveArmazenamento, []);
      const novasCorridas = corridasAtuais.filter((corrida) => corrida.id !== id);
      
      console.log('Lista de corridas após exclusão:', novasCorridas.length);
      
      // Salvar no localStorage usando a função utilitária
      salvarDados(chaveArmazenamento, novasCorridas);
      setCorridas(novasCorridas);
      exibirMensagem('Corrida excluída com sucesso!', 'sucesso');
    } catch (erro) {
      console.error('Erro ao excluir corrida:', erro);
      exibirMensagem('Erro ao excluir corrida. Tente novamente.', 'erro');
    }
  };

  const exibirMensagem = (texto: string, tipo: 'sucesso' | 'erro') => {
    setMensagem({ texto, tipo });
    setTimeout(() => {
      setMensagem(null);
    }, 5000);
  };

  const toggleFormulario = () => {
    setMostrarFormulario(!mostrarFormulario);
    if (!mostrarFormulario) {
      setCorridaParaEditar(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 md:mb-0">Corridas Diárias</h1>
        <button
          onClick={toggleFormulario}
          className={`flex items-center justify-center px-4 py-2 rounded-md ${
            mostrarFormulario 
              ? 'bg-gray-600 hover:bg-gray-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white transition-colors font-medium shadow-md`}
        >
          {mostrarFormulario ? (
            <>
              <FaTimes className="mr-2" /> Fechar Formulário
            </>
          ) : (
            <>
              <FaPlus className="mr-2" /> Adicionar Nova Corrida
            </>
          )}
        </button>
      </div>

      {mensagem && (
        <div
          className={`p-3 sm:p-4 mb-6 rounded-md border-2 ${
            mensagem.tipo === 'sucesso'
              ? 'bg-green-100 border-green-400 text-white dark:bg-green-900/30 dark:border-green-600 dark:text-green-300'
              : 'bg-red-100 border-red-400 text-white dark:bg-red-900/30 dark:border-red-600 dark:text-red-300'
          } shadow-md`}
        >
          {mensagem.texto}
        </div>
      )}

      {mostrarFormulario && (
        <div className="mb-6 sm:mb-8">
          <FormularioCorrida
            corridaParaEditar={corridaParaEditar || undefined}
            onSalvar={salvarCorrida}
          />
        </div>
      )}

      <div id="tabela-corridas">
        <TabelaCorridas
          corridas={corridas}
          onEditar={editarCorrida}
          onExcluir={excluirCorrida}
        />
      </div>
    </div>
  );
};

export default CorridasDiarias; 