import React, { useState, useEffect } from 'react';
import { Database, Key, Copy, Check, ExternalLink, X, AlertOctagon, HelpCircle, Server } from 'lucide-react';
import { getCredentials, saveLocalCredentials, clearLocalCredentials, resetSupabaseInstance, SUPABASE_SQL_SCHEMA, getSupabaseClient } from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export default function SupabaseConfigModal({ isOpen, onClose, onConfigChanged }: SupabaseConfigModalProps) {
  const { url: initialUrl, anonKey: initialKey, source } = getCredentials();
  const [url, setUrl] = useState(initialUrl);
  const [anonKey, setAnonKey] = useState(initialKey);
  const [isCopied, setIsCopied] = useState(false);
  const [status, setStatus] = useState<'not_tested' | 'testing' | 'success' | 'error'>('not_tested');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');

  useEffect(() => {
    if (isOpen) {
      const creds = getCredentials();
      setUrl(creds.url);
      setAnonKey(creds.anonKey);
      setStatus('not_tested');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = () => {
    saveLocalCredentials(url, anonKey);
    onConfigChanged();
    setStatus('not_tested');
    testConnection();
  };

  const handleClear = () => {
    clearLocalCredentials();
    setUrl('');
    setAnonKey('');
    onConfigChanged();
    setStatus('not_tested');
    setErrorMessage('');
  };

  const testConnection = async () => {
    setStatus('testing');
    setErrorMessage('');
    
    // Force reset to pick up new values
    resetSupabaseInstance();
    const client = getSupabaseClient();
    
    if (!client) {
      setStatus('error');
      setErrorMessage('Credenciais do Supabase ausentes ou inválidas. Por favor insira a URL e a Anon Key.');
      return;
    }

    try {
      // Perform simple fetch check
      const { data, error } = await client.from('agencias').select('id').limit(1);
      
      if (error) {
        // If table doesn't exist, it is a specific error
        if (error.code === '42P01') {
          setStatus('error');
          setErrorMessage('Conexão estabelecida com sucesso, mas a tabela "agencias" não foi encontrada. Crie a tabela usando o script SQL na aba ao lado.');
        } else {
          throw error;
        }
      } else {
        setStatus('success');
      }
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Falha ao conectar com o Supabase. Verifique se o RLS está ativo e as credenciais estão corretas.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] border border-[#D6D6CC]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF9F5] border-b border-[#D6D6CC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#EBEBE3] text-[#5A5A40] rounded-xl border border-[#D6D6CC]">
              <Database className="w-5 h-5 text-[#5A5A40]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#5A5A40] text-lg">Conexão com o Supabase</h3>
              <p className="text-xs text-[#7A7A6A]">Integre o sistema ao seu próprio banco de dados em tempo real</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-[#EBEBE3] text-[#7A7A6A] hover:text-[#2D2D2A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-[#FAF9F5] bg-[#FAF9F5]/40 flex gap-4 text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'config' 
                ? 'border-[#5A5A40] text-[#5A5A40]' 
                : 'border-transparent text-[#7A7A6A] hover:text-[#2D2D2A]'
            }`}
          >
            Configurar Credenciais
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'sql' 
                ? 'border-[#5A5A40] text-[#5A5A40]' 
                : 'border-transparent text-[#7A7A6A] hover:text-[#2D2D2A]'
            }`}
          >
            Gerar Tabela SQL
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'config' ? (
            <div className="space-y-5">
              
              <div className="p-4 bg-[#F5F5ED] border border-[#D6CE93]/80 rounded-xl text-xs text-[#7A7A6A] space-y-2">
                <span className="font-serif font-bold text-[#5A5A40] block mb-1 flex items-center gap-1.5 text-sm">
                  <Server className="w-3.5 h-3.5 text-[#5A5A40]" /> Como isso funciona?
                </span>
                <p>
                  Atualmente, as informações estão salvas no <strong>armazenamento local (localStorage)</strong> do seu navegador. 
                  Para conectar o sistema a um banco de dados persistente real no Supabase:
                </p>
                <ol className="list-decimal pl-4 space-y-1 mt-1 text-[#7A7A6A]">
                  <li>Acesse o dashboard do seu <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#5A5A40] hover:underline inline-flex items-center gap-0.5 font-bold">Supabase <ExternalLink className="w-2.5 h-2.5" /></a></li>
                  <li>Copie as credenciais da seção <strong>Project Settings &gt; API</strong></li>
                  <li>Insira as chaves abaixo e teste a conexão</li>
                </ol>
                <p className="text-[#A3A380] mt-2 italic font-serif">
                  *As chaves inseridas abaixo ficarão salvas apenas no seu navegador local para fins de desenvolvimento. Para produção no GitHub/Vercel, adicione as variáveis no seu painel da Vercel.
                </p>
              </div>

              {/* Status Indicator */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#A3A380]">Origem Configurada Atualmente</label>
                <div className="flex items-center gap-2">
                  {source === 'env' && (
                    <span className="px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-800 rounded-full border border-emerald-250 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Variáveis de Ambiente (.env)
                    </span>
                  )}
                  {source === 'localStorage' && (
                    <span className="px-3 py-1 text-xs font-medium bg-[#F5F5ED] text-[#5A5A40] rounded-full border border-[#D6CE93] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A3A380]" /> Salvo localmente no Preview
                    </span>
                  )}
                  {source === 'none' && (
                    <span className="px-3 py-1 text-xs font-medium bg-[#EBEBE3] text-[#7A7A6A] rounded-full border border-[#D6D6CC] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7A7A6A]" /> Sem Conexão (Modo Local Fallback Ativo)
                    </span>
                  )}
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-[#5A5A40] flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-[#A3A380]" /> Supabase URL
                    </label>
                    <span className="text-xs text-[#7A7A6A]">Ex: https://xxxx.supabase.co</span>
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Sua URL do Supabase"
                    className="w-full px-3.5 py-2 border border-[#D6D6CC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40]"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-[#5A5A40] flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-[#A3A380]" /> Supabase Anon Key
                    </label>
                    <span className="text-xs text-[#7A7A6A]">Chave pública anon</span>
                  </div>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="Sua Anon Key"
                    className="w-full px-3.5 py-2 border border-[#D6D6CC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40] font-mono"
                  />
                </div>
              </div>

              {/* Status banner */}
              {status !== 'not_tested' && (
                <div className={`p-4 rounded-xl leading-relaxed text-sm ${
                  status === 'testing' ? 'bg-blue-50 text-blue-800 border border-blue-100' :
                  status === 'success' ? 'bg-[#FAF9F5] text-[#5A5A40] border border-[#D6CE93]' :
                  'bg-rose-50 text-rose-800 border border-rose-100'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">
                      {status === 'testing' && <span className="block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
                      {status === 'success' && <Check className="w-4 h-4 text-emerald-600 font-bold" />}
                      {status === 'error' && <AlertOctagon className="w-4 h-4 text-rose-600" />}
                    </div>
                    <div className="flex-1">
                      <strong className="font-serif font-bold block text-sm">
                        {status === 'testing' && 'Testando Conexão e Tabelas...'}
                        {status === 'success' && 'Conectado com Sucesso!'}
                        {status === 'error' && 'Erro na Conexão'}
                      </strong>
                      <p className="text-xs mt-1">
                        {status === 'testing' && 'Estamos enviando uma requisição de validação para o banco de dados.'}
                        {status === 'success' && 'O sistema está conectado de forma estável com o banco de dados e a tabela de agências foi validada!'}
                        {status === 'error' && errorMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={!url && !anonKey}
                  className="px-4 py-2 border border-[#D6D6CC] text-[#7A7A6A] hover:bg-[#FAF9F5] rounded-full text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Limpar Campos
                </button>
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={!url || !anonKey || status === 'testing'}
                  className="px-4 py-2 bg-[#EBEBE3] hover:bg-[#FAF9F5] text-[#5A5A40] rounded-full text-xs font-semibold border border-[#D6D6CC] transition-colors disabled:opacity-50"
                >
                  Testar Conexão
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-full text-xs font-bold shadow-xs hover:shadow-md transition-all"
                >
                  Salvar Configuração
                </button>
              </div>

            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-[#FAF9F5] border border-[#D6D6CC] rounded-xl text-xs text-[#7A7A6A] space-y-2">
                <span className="font-serif font-bold text-[#5A5A40] block mb-1 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#5A5A40]" /> Como configurar a tabela no Supabase?
                </span>
                <p>
                  Para habilitar o armazenamento das Agências de Turismo, você precisa criar uma tabela chamada <code>agencias</code> no seu projeto.
                </p>
                <p>
                  Selecione seu projeto no console do Supabase, clique em <strong>SQL Editor</strong> no menu lateral, cole as instruções SQL abaixo e clique em <strong>Run</strong>.
                </p>
              </div>

              {/* Code block tool */}
              <div className="relative border border-[#D6D6CC] rounded-xl overflow-hidden bg-slate-900 font-mono text-xs">
                <div className="flex justify-between items-center px-4 py-2 bg-slate-800 text-slate-400 border-b border-slate-700">
                  <span>schema.sql</span>
                  <button
                    onClick={handleCopySQL}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-slate-200 leading-relaxed max-h-[250px]">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>

              <div className="p-4 bg-[#FAF9F5] border border-[#D6CE93]/70 rounded-xl flex items-start gap-2.5 text-xs text-[#7A7A6A] leading-normal">
                <HelpCircle className="w-4 h-4 text-[#5A5A40] shrink-0 mt-0.5" />
                <div>
                  <p className="font-serif font-bold text-[#5A5A40]">Política de Acesso do Banco (Row Level Security - RLS)</p>
                  <p className="text-[#7A7A6A] mt-1">
                    O script acima inclui uma política chamada <strong>&quot;Acesso público total&quot;</strong> que permite operações livres. Para ambientes em produção, altere ou configure autenticação usando as ferramentas de autenticação integradas.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF9F5] border-t border-[#D6D6CC] flex items-center justify-between text-xs text-[#7A7A6A]">
          <span className="font-serif italic font-bold">Pronto para GitHub e Deploy no Vercel</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-semibold rounded-full transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
