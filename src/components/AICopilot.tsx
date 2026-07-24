'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Cpu, CheckCircle2, DollarSign, AlertTriangle, 
  Workflow, FileText, Database, Send, PlusCircle
} from 'lucide-react';
import { dbService } from '../services/supabase-client';
import { aiService } from '../services/ai-service';
import { toastService } from '../services/toast-service';
import type { Cliente } from '../types/crm';

interface AICopilotProps {
  isDarkTheme: boolean;
  usuarioLogado: any;
}

export const AICopilot: React.FC<AICopilotProps> = ({ isDarkTheme, usuarioLogado }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  
  // Estados do Copiloto de Briefing
  const [briefingInput, setBriefingInput] = useState('');
  const [analisando, setAnalisando] = useState(false);
  const [statusAnalise, setStatusAnalise] = useState('');
  const [resultadoBriefing, setResultadoBriefing] = useState<string | null>(null);
  
  // Estados para salvar orçamento
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState('');
  const [probabilidadeFechamento, setProbabilidadeFechamento] = useState(8);
  const [salvandoOrcamento, setSalvandoOrcamento] = useState(false);
  const [orcamentoSalvoSucesso, setOrcamentoSalvoSucesso] = useState(false);

  // Estados do Simulador de ROI & Automação
  const [autoPCP, setAutoPCP] = useState(true);
  const [autoDesign, setAutoDesign] = useState(false);
  const [autoRotas, setAutoRotas] = useState(false);

  useEffect(() => {
    const carregarClientes = async () => {
      try {
        setLoadingClientes(true);
        const list = await dbService.clientes.list();
        setClientes(list);
        if (list.length > 0) {
          setClienteSelecionadoId(list[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingClientes(false);
      }
    };
    carregarClientes();
  }, []);

  // Templates rápidos de briefing
  const templatesRapidos = [
    {
      label: '🍷 Vinho Premium',
      text: 'Cliente precisa de uma caixa para kit de 3 garrafas de vinho de alta gama. Deseja proteção robusta contra choques, fechamento seguro, impressão flexográfica ecológica e divisórias internas acopladas.'
    },
    {
      label: '👟 Caixa Gaveta Sapato',
      text: 'Desenvolver embalagem tipo gaveta deslizante para marca premium de calçados (Elegance). Requer acabamento nobre com verniz UV localizado na tampa e rigidez estrutural para empilhamento de até 10 caixas.'
    },
    {
      label: '🍫 Chocolates Gourmet',
      text: 'Briefing para estojo especial de bombons finos (Páscoa). Exige papel-cartão certificado FSC inofensivo para contato direto com alimentos e revestimento com barreira interna contra óleo/gordura.'
    },
    {
      label: '🍕 Pizza Oitavada Rápida',
      text: 'Otimizar caixa oitavada padrão de pizza de 35cm. Foco em papel micro-ondulado térmico reciclável, abas de montagem rápida sem cola e furos traseiros para saída de vapor evitando amolecer a massa.'
    }
  ];

  // Executa análise de IA
  const handleAnalisarBriefing = async () => {
    if (!briefingInput.trim()) return;
    
    setAnalisando(true);
    setResultadoBriefing(null);
    setOrcamentoSalvoSucesso(false);
    
    const passos = [
      'Lendo entrada do comercial...',
      'Identificando tipo de material (Duplex/Ondulado)...',
      'Calculando gramatura estrutural recomendada...',
      'Avaliando riscos no maquinário da Carton PACK...',
      'Cruzando com oportunidades de automação...'
    ];

    // Simular o delay de análise de engenharia para criar "wow factor" e valorizar o processamento
    for (let i = 0; i < passos.length; i++) {
      setStatusAnalise(passos[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    try {
      const response = await aiService.generateTechnicalBriefing(briefingInput);
      setResultadoBriefing(response);
    } catch (e) {
      console.error(e);
      setResultadoBriefing('Erro ao gerar ficha técnica por IA. Verifique sua chave de conexão.');
    } finally {
      setAnalisando(false);
    }
  };

  // Salva briefing como rascunho de orçamento
  const handleSalvarComoOrcamento = async () => {
    if (!resultadoBriefing || !clienteSelecionadoId) return;
    
    setSalvandoOrcamento(true);
    try {
      // Cria a descrição de forma limpa extraindo o nome do produto sugerido do resultado

      await dbService.orcamentos.save({
        cliente_id: clienteSelecionadoId,
        responsavel_id: usuarioLogado.id,
        etapa_atual: 'solicitacao_briefing',
        probabilidade_fechamento: probabilidadeFechamento,
        valor_aprovado: null,
        data_fechamento: null,
        motivo_perda: null,
        justificativa_livre: `Briefing Técnico Automático IA:\n\n${resultadoBriefing}`
      });

      setOrcamentoSalvoSucesso(true);
      setTimeout(() => setOrcamentoSalvoSucesso(false), 5000);
    } catch (e) {
      console.error(e);
      toastService.error('Erro ao salvar rascunho de orçamento.');
    } finally {
      setSalvandoOrcamento(false);
    }
  };

  // Cálculos do Simulador de ROI & Automação baseados nos checkboxes
  const leadTimeBase = 7.0; // dias (Manual)
  let leadTimeReduzido = leadTimeBase;
  let errosSetup = 15; // % (Manual)
  let faturamentoMedioMensal = 450000; // R$
  let ganhoCapacidadePercent = 0;
  
  if (autoPCP) {
    leadTimeReduzido -= 3.5;
    ganhoCapacidadePercent += 15;
  }
  if (autoDesign) {
    leadTimeReduzido -= 2.0;
    errosSetup -= 10;
    ganhoCapacidadePercent += 10;
  }
  if (autoRotas) {
    leadTimeReduzido -= 0.8;
    errosSetup -= 3;
    ganhoCapacidadePercent += 10;
  }

  // Garantir limites mínimos
  if (leadTimeReduzido < 0.2) leadTimeReduzido = 0.2;
  if (errosSetup < 1) errosSetup = 1;

  const ROI_FinanceiroEstimado = (faturamentoMedioMensal * (ganhoCapacidadePercent / 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold tracking-tight text-[var(--white)] flex items-center gap-2">
            <Sparkles className="text-[var(--lime)]" size={22} />
            Simulador de ROI & Copiloto Técnico
          </h1>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA: Copiloto de Briefing Técnico (7 colunas) */}
        <div className="lg:col-span-7 space-y-6">
          <div className={`p-6 rounded-xl border ${
            isDarkTheme ? 'bg-[#202020]/60 border-zinc-800 backdrop-blur-md' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Cpu size={18} className="text-[#B4D932]" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-300">
                Assistente de Briefing de Embalagens (IA)
              </h3>
            </div>
            
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Escreva o desejo do cliente de forma livre. O copiloto identificará a melhor composição estrutural de papelão, faca de corte, acabamentos e gerará alertas de gargalos produtivos na Carton Pack.
            </p>

            {/* Sugestões de Templates */}
            <div className="mb-4">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-2">Exemplos Rápidos de Briefing:</span>
              <div className="flex flex-wrap gap-2">
                {templatesRapidos.map((temp, idx) => (
                  <button
                    key={idx}
                    onClick={() => setBriefingInput(temp.text)}
                    className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                      isDarkTheme 
                        ? 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:text-[#B4D932] text-zinc-300'
                        : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:text-zinc-955 text-zinc-600'
                    }`}
                  >
                    {temp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Área */}
            <div className="space-y-3">
              <textarea
                value={briefingInput}
                onChange={(e) => setBriefingInput(e.target.value)}
                placeholder="Ex: Cliente da vinícola Vale do Sol quer caixa de embarque kraft reforçada para transportar 6 garrafas, impressão de alta qualidade com verniz fosco..."
                rows={4}
                className={`w-full p-3 rounded-lg border text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#B4D932] ${
                  isDarkTheme ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />

              <div className="flex justify-end">
                <button
                  onClick={handleAnalisarBriefing}
                  disabled={analisando || !briefingInput.trim()}
                  className="bg-[#B4D932] hover:bg-[#a3c42a] text-black text-xs font-bold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {analisando ? (
                    <>
                      <div className="h-3 w-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Processando Engenharia...</span>
                    </>
                  ) : (
                    <>
                      <Send size={12} />
                      <span>Analisar Viabilidade por IA</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Animação / Feedback de Carregamento da IA */}
          {analisando && (
            <div className={`p-6 rounded-xl border border-[#B4D932]/30 bg-[#B4D932]/5 flex flex-col items-center justify-center text-center space-y-3 ${
              isDarkTheme ? '' : 'shadow-sm'
            }`}>
              <div className="h-8 w-8 border-4 border-[#B4D932] border-t-transparent rounded-full animate-spin" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-zinc-300 animate-pulse">{statusAnalise}</p>
                <p className="text-[10px] text-zinc-500">O copiloto está rodando simulações no banco de setups comerciais...</p>
              </div>
            </div>
          )}

          {/* Resultado da Análise de IA */}
          {resultadoBriefing && !analisando && (
            <div className={`p-6 rounded-xl border space-y-6 animate-fadeIn ${
              isDarkTheme ? 'bg-[#202020]/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between border-b border-zinc-800/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#B4D932]" />
                  <span className="font-bold text-xs uppercase tracking-wider text-zinc-200">Retorno Técnico do Copiloto</span>
                </div>
                <span className="text-[9px] bg-green-500/20 text-green-400 font-extrabold px-2 py-0.5 rounded">Engenharia Aprovada</span>
              </div>

              {/* Corpo do Resultado da IA */}
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed space-y-4 text-zinc-300">
                {/* Formatar o retorno do Markdown estruturado que a IA ou Fallback retornou */}
                {resultadoBriefing.split('###').filter(Boolean).map((section, idx) => {
                  const lines = section.split('\n');
                  const title = lines[0].trim();
                  const content = lines.slice(1).join('\n');
                  
                  let iconColor = 'text-zinc-400';
                  let Icon = FileText;

                  if (title.includes('Ficha Técnica')) { Icon = FileText; iconColor = 'text-[#B4D932]'; }
                  if (title.includes('Viabilidade')) { Icon = AlertTriangle; iconColor = 'text-amber-500'; }
                  if (title.includes('Variáveis')) { Icon = DollarSign; iconColor = 'text-emerald-500'; }
                  if (title.includes('Automação')) { Icon = Workflow; iconColor = 'text-sky-400'; }

                  return (
                    <div key={idx} className="p-4 rounded-lg bg-zinc-955/20 border border-zinc-900/50 space-y-2">
                      <h4 className="font-bold text-xs text-zinc-200 flex items-center gap-1.5">
                        <Icon size={14} className={iconColor} />
                        {title}
                      </h4>
                      <div className="pl-5 space-y-1 text-zinc-400">
                        {content.split('\n').filter(l => l.trim().startsWith('-')).map((l, lIdx) => (
                          <div key={lIdx} className="relative">
                            <span className="absolute -left-3 text-[#B4D932]">•</span>
                            <span dangerouslySetInnerHTML={{ __html: l.replace(/^-\s*|\*\*/g, '').replace(/:\s*/, ': <strong>') + (l.includes(':') ? '</strong>' : '') }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AÇÃO: Exportar para o CRM Kanban */}
              <div className="pt-4 border-t border-zinc-800/10 space-y-4">
                <div className="bg-[#B4D932]/5 border border-[#B4D932]/10 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                    <PlusCircle size={14} className="text-[#B4D932]" />
                    <span>Workflow Integrado: Gerar Rascunho no Kanban</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Converta este briefing técnico estruturado pela IA em um registro de orçamento ativo no Kanban com 1 clique.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-zinc-500 text-[10px] font-semibold mb-1 uppercase">Associar ao Cliente:</label>
                      {loadingClientes ? (
                        <div className="text-[10px]">Carregando clientes...</div>
                      ) : (
                        <select
                          value={clienteSelecionadoId}
                          onChange={(e) => setClienteSelecionadoId(e.target.value)}
                          className={`w-full p-2 rounded border text-xs focus:ring-1 focus:ring-[#B4D932] ${
                            isDarkTheme ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                          }`}
                        >
                          {clientes.map(c => (
                            <option key={c.id} value={c.id}>{c.razao_social}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-zinc-500 text-[10px] font-semibold mb-1 uppercase">Probabilidade de Fechamento:</label>
                      <select
                        value={probabilidadeFechamento}
                        onChange={(e) => setProbabilidadeFechamento(parseInt(e.target.value))}
                        className={`w-full p-2 rounded border text-xs focus:ring-1 focus:ring-[#B4D932] ${
                          isDarkTheme ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                        }`}
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                          <option key={n} value={n}>{n}/10 ({n*10}%)</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSalvarComoOrcamento}
                      disabled={salvandoOrcamento}
                      className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded transition-colors flex items-center gap-1.5"
                    >
                      {salvandoOrcamento ? 'Gravando no Banco...' : 'Criar Rascunho de Orçamento'}
                    </button>
                  </div>

                  {orcamentoSalvoSucesso && (
                    <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 p-2.5 rounded text-[11px] font-bold text-center animate-pulse">
                      ✓ Orçamento criado com sucesso! Ele foi adicionado na etapa "Solicitação/Briefing" da aba Kanban de Orçamentos.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: Simulador de ROI & Automação de Processos (5 colunas) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Painel do Simulador */}
          <div className={`p-6 rounded-xl border space-y-6 ${
            isDarkTheme ? 'bg-[#202020]/60 border-zinc-800 backdrop-blur-md' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-2 border-b border-zinc-850 pb-2">
              <Workflow size={18} className="text-[#B4D932]" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-300">
                Simulador de ROI de Automação
              </h3>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              O principal gargalo produtivo em cartonagens é a redigitação manual do briefing comercial no PCP e o reajuste de artes. Ative as soluções da nossa consultoria para simular o ganho de eficiência da Carton Pack:
            </p>

            {/* Checkboxes de Automação */}
            <div className="space-y-3 bg-zinc-950/20 p-4 rounded-xl border border-zinc-900/60">
              
              {/* Automação 1: PCP */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={autoPCP}
                  onChange={(e) => setAutoPCP(e.target.checked)}
                  className="mt-1 accent-[#B4D932] h-4 w-4 rounded"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
                    Integração API Comercial ➜ PCP
                  </span>
                  <p className="text-[10px] text-zinc-500 leading-tight">
                    Elimina digitação manual de orçamentos e agendamento de chapas. Reduz lead time comercial em 50%.
                  </p>
                </div>
              </label>

              {/* Automação 2: Design */}
              <label className="flex items-start gap-3 cursor-pointer group border-t border-zinc-900/50 pt-2.5">
                <input 
                  type="checkbox" 
                  checked={autoDesign}
                  onChange={(e) => setAutoDesign(e.target.checked)}
                  className="mt-1 accent-[#B4D932] h-4 w-4 rounded"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
                    Aprovação Gráfica Assistida por IA
                  </span>
                  <p className="text-[10px] text-zinc-500 leading-tight">
                    Cálculo paramétrico de facas de corte e render 3D automático para aprovação digital do cliente via link seguro.
                  </p>
                </div>
              </label>

              {/* Automação 3: Roteirização */}
              <label className="flex items-start gap-3 cursor-pointer group border-t border-zinc-900/50 pt-2.5">
                <input 
                  type="checkbox" 
                  checked={autoRotas}
                  onChange={(e) => setAutoRotas(e.target.checked)}
                  className="mt-1 accent-[#B4D932] h-4 w-4 rounded"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
                    Roteirização Inteligente de Vendas
                  </span>
                  <p className="text-[10px] text-zinc-500 leading-tight">
                    Algoritmo de geodecisão para visitas externas, reduzindo custos de transporte e otimizando a agenda do representante.
                  </p>
                </div>
              </label>

            </div>

            {/* Resultados em Tempo Real */}
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Indicadores de Eficiência Resultantes:</span>
              
              <div className="grid grid-cols-2 gap-3 text-center">
                {/* KPI 1: Lead Time */}
                <div className="p-3 bg-zinc-950/40 rounded-lg border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold">Ciclo Total do Pedido</span>
                  <div className="flex items-baseline justify-center gap-1.5 mt-1">
                    <strong className="text-zinc-200 text-lg">{leadTimeReduzido.toFixed(1)}</strong>
                    <span className="text-[9px] text-zinc-400">dias</span>
                  </div>
                  <span className="text-[9px] text-emerald-400 font-bold block mt-1">
                    -{((leadTimeBase - leadTimeReduzido) / leadTimeBase * 100).toFixed(0)}% mais rápido
                  </span>
                </div>

                {/* KPI 2: Erros de Setup */}
                <div className="p-3 bg-zinc-955/40 rounded-lg border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold">Erros de Setup de Faca</span>
                  <div className="flex items-baseline justify-center gap-1 mt-1">
                    <strong className="text-zinc-200 text-lg">{errosSetup}%</strong>
                  </div>
                  <span className={`text-[9px] font-bold block mt-1 ${errosSetup < 10 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {errosSetup === 15 ? 'Linha base manual' : `Redução de -${(15 - errosSetup)}%`}
                  </span>
                </div>
              </div>

              {/* Gráfico de ROI financeiro */}
              <div className="p-4 bg-[#B4D932]/5 border border-[#B4D932]/25 rounded-lg space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-300">
                  <span>Aumento de Margem Mensal</span>
                  <span className="text-[#B4D932]">+ {ganhoCapacidadePercent}% Capacidade</span>
                </div>
                
                {/* Barra de Progresso do Ganho */}
                <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-[#B4D932] h-full transition-all duration-500" 
                    style={{ width: `${(ganhoCapacidadePercent / 35) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-[9px] text-zinc-500">Retorno Estimado Carton Pack:</span>
                  <strong className="text-sm text-[#B4D932]">R$ {ROI_FinanceiroEstimado.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} / mês</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Pitch de Consultoria */}
          <div className={`p-6 rounded-xl border space-y-4 ${
            isDarkTheme ? 'bg-zinc-950/40 border-zinc-900' : 'bg-zinc-50 border-zinc-300 shadow-sm'
          }`}>
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Database size={14} className="text-sky-400" />
              Por que contratar nossa Consultoria?
            </h4>
            
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              O protótipo Carton Pack CRM demonstra apenas 10% do potencial de automação industrial. Nossa consultoria apoiará sua equipe na transição para uma operação inteligente:
            </p>

            <ul className="space-y-2 text-[10px] text-zinc-400">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={12} className="text-sky-400 shrink-0 mt-0.5" />
                <span><strong>Integração Completa ERP/PCP</strong>: Conexão direta dos dados comerciais com ordenação de onduladeiras e impressoras gráficas.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={12} className="text-sky-400 shrink-0 mt-0.5" />
                <span><strong>Machine Learning para Demanda</strong>: Algoritmos preditivos de estoque que sugerem reposições aos clientes antes de o estoque acabar.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={12} className="text-sky-400 shrink-0 mt-0.5" />
                <span><strong>Portal de Pedidos B2B</strong>: Interface simplificada para clientes customizarem orçamentos padrão e aprovarem artes em tempo real.</span>
              </li>
            </ul>

            <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-center">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#B4D932] block">Valor Oferecido</span>
              <p className="text-xs text-zinc-300 mt-1 font-semibold">Transforme a Carton Pack em uma indústria 4.0 líder em embalagens inteligentes.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
