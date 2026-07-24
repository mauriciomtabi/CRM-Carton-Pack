'use client';

import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Database, Key } from 'lucide-react';
import { aiService } from '../services/ai-service';
import { toastService } from '../services/toast-service';

interface SettingsPanelProps {
  isDarkTheme: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isDarkTheme }) => {
  const [apiKey, setApiKey] = useState(aiService.getApiKey());
  const [salvando, setSalvando] = useState(false);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      aiService.setApiKey(apiKey);
      toastService.success('Chave de API do Gemini salva com sucesso! O CRM agora fará chamadas reais ao modelo Flash.');
    } catch (e) {
      console.error(e);
      toastService.error('Erro ao salvar chave de API.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl md:text-2xl font-bold tracking-tight text-[var(--white)]">Configurações do CRM</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulário Gemini Key */}
        <form onSubmit={handleSalvar} className={`p-6 rounded-xl border space-y-4 ${
          isDarkTheme ? 'bg-[#202020] border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 border-b border-zinc-800/10 pb-2">
            <Key size={18} className="text-[#B4D932]" />
            <h3 className="font-bold text-sm text-zinc-200 uppercase tracking-wider">Configuração Gemini IA</h3>
          </div>
          
          <p className="text-xs text-zinc-400 leading-relaxed">
            Insira sua chave da API do Google Gemini para habilitar o resumo de carteira dinâmico, follow-ups de alta fidelidade e priorizações estruturadas. 
            Se deixada em branco, o sistema rodará em **Modo de Demonstração**, exibindo insights gerados localmente.
          </p>

          <div>
            <label className="block text-zinc-400 text-xs mb-1 font-semibold">Google Gemini API Key</label>
            <input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className={`w-full p-2.5 rounded-lg border text-xs ${isDarkTheme ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-950'}`}
            />
          </div>

          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={salvando}
              className="bg-[#B4D932] hover:bg-[#a3c42a] text-black text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              Salvar Chave
            </button>
          </div>
        </form>

        {/* Informações de Migração Supabase */}
        <div className={`p-6 rounded-xl border space-y-4 ${
          isDarkTheme ? 'bg-[#202020] border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 border-b border-zinc-800/10 pb-2">
            <Database size={18} className="text-sky-400" />
            <h3 className="font-bold text-sm text-zinc-200 uppercase tracking-wider">Migração de Produção</h3>
          </div>
          
          <p className="text-xs text-zinc-400 leading-relaxed">
            Este CRM comercial foi desenvolvido com o banco de dados Supabase em mente. O script de schema PostgreSQL está pronto para implantação.
          </p>

          <div className="bg-zinc-950/40 p-3 rounded-lg border border-zinc-850 space-y-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Políticas RLS Prontas no schema.sql</span>
            </div>
            <p className="text-zinc-500 leading-relaxed">
              O schema inclui triggers de cálculo automático do status de carteira (ativo/inativo/alerta) no Postgres, além de políticas RLS completas impedindo representantes de ler carteiras de terceiros.
            </p>
          </div>

          <div className="text-xs text-zinc-400 leading-relaxed">
            Para subir a produção:
            <ol className="list-decimal pl-4 mt-1.5 space-y-1">
              <li>Crie um projeto no Supabase</li>
              <li>Rode o script <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-200">schema.sql</code> no SQL Editor do console</li>
              <li>Configure as variáveis <code className="bg-zinc-800 px-1 py-0.5 text-zinc-200 rounded">VITE_SUPABASE_URL</code> e <code className="bg-zinc-800 px-1 py-0.5 text-zinc-200 rounded">VITE_SUPABASE_ANON_KEY</code> no seu arquivo .env</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
