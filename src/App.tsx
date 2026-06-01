import React, { useState, useEffect } from 'react';
import { 
  Plus, Database, RefreshCw, Compass, ShieldAlert, CheckCircle2, 
  HelpCircle, ServerCrash, Github, ArrowUpRight, BookOpen
} from 'lucide-react';
import { Agencia, StatusAgencia } from './types';
import { 
  getAgencias, addAgencia, editAgencia, removeAgencia, 
  getCredentials, getSupabaseClient 
} from './lib/supabase';
import StatsSection from './components/StatsSection';
import AgenciaList from './components/AgenciaList';
import AgenciaForm from './components/AgenciaForm';
import SupabaseConfigModal from './components/SupabaseConfigModal';

export default function App() {
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbSource, setDbSource] = useState<'env' | 'localStorage' | 'none'>('none');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingAgencia, setEditingAgencia] = useState<Agencia | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load current agencies
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const { source } = getCredentials();
        setDbSource(source);
        const data = await getAgencias();
        setAgencias(data);
      } catch (err) {
        console.error('Erro ao ler agências:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [refreshTrigger]);

  const handleCreateOrUpdate = async (formData: Omit<Agencia, 'id' | 'created_at'>) => {
    if (editingAgencia) {
      // Update
      const updated = await editAgencia(editingAgencia.id, formData);
      if (updated) {
        setRefreshTrigger(prev => prev + 1);
      }
    } else {
      // Create
      const created = await addAgencia(formData);
      if (created) {
        setRefreshTrigger(prev => prev + 1);
      }
    }
    setEditingAgencia(null);
  };

  const handleDelete = async (id: string) => {
    const success = await removeAgencia(id);
    if (success) {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleStatusChange = async (id: string, newStatus: StatusAgencia) => {
    const updated = await editAgencia(id, { status: newStatus });
    if (updated) {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleOpenEdit = (agencia: Agencia) => {
    setEditingAgencia(agencia);
    setIsFormOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingAgencia(null);
    setIsFormOpen(true);
  };

  const handleConfigChanged = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#2D2D2A] flex flex-col selection:bg-[#D6CE93] selection:text-[#2D2D2A]">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#D6D6CC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5A5A40] rounded-xl flex items-center justify-center text-white shadow-xs">
              <Compass className="w-5.5 h-5.5 animate-spin-slow" />
            </div>
            <div>
              <h1 className="font-serif font-bold italic text-[#5A5A40] text-base sm:text-lg tracking-tight leading-none">
                Voyage Fluxo
              </h1>
              <p className="text-[10px] text-[#A3A380] font-bold tracking-[0.15em] uppercase mt-1">
                Controle de Implantação
              </p>
            </div>
          </div>

          {/* Center/Right Status Badges & config triggers */}
          <div className="flex items-center gap-3">
            
            {/* Database source indicator */}
            <button
              onClick={() => setIsConfigOpen(true)}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold hover:shadow-xs transition-all pointer-events-auto ${
                dbSource === 'env' 
                  ? 'bg-emerald-50/50 text-emerald-800 border-emerald-200/50 hover:bg-emerald-100/50' 
                  : dbSource === 'localStorage'
                  ? 'bg-[#EBEBE3] text-[#5A5A40] border-[#D6D6CC] hover:bg-[#FAF9F5]'
                  : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-250'
              }`}
            >
              <Database className="w-3.5 h-3.5 shrink-0" />
              <span>
                {dbSource === 'env' && 'Banco: Supabase (Env)'}
                {dbSource === 'localStorage' && 'Banco: Supabase (Local)'}
                {dbSource === 'none' && 'Banco: Local (Fallback)'}
              </span>
            </button>

            {/* Config connection button */}
            <button
              onClick={() => setIsConfigOpen(true)}
              className="px-4 py-2 bg-[#EBEBE3] hover:bg-[#DEDECF] text-[#5A5A40] border border-[#D6D6CC] font-semibold text-xs rounded-full transition-all flex items-center gap-1.5 shadow-xs"
              id="btn-configurar-supabase"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Conexão Supabase</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome and actions row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[#A3A380] text-xs font-bold tracking-[0.2em] uppercase block">Painel de Monitoramento</span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#5A5A40] tracking-tight">
              Agências de Turismo
            </h2>
            <p className="text-sm text-[#7A7A6A] max-w-xl">
              Gerencie o funil de implantação, credenciamento e status de ativação das agências parceiras brasileiras.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Sync Data trigger */}
            <button
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              disabled={isLoading}
              className="p-2.5 bg-white border border-[#D6D6CC] text-[#5A5A40] hover:bg-[#FAF9F5] rounded-xl transition-colors disabled:opacity-50"
              title="Recarregar Dados"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#5A5A40]' : ''}`} />
            </button>

            {/* Quick action build new agency */}
            <button
              onClick={handleOpenCreate}
              className="px-6 py-3 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-semibold text-sm rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              id="btn-cadastrar-agencia"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Agência</span>
            </button>
          </div>
        </div>

        {/* Local Storage fallback Warning Banner */}
        {dbSource === 'none' && (
          <div className="bg-[#FAF9F5] border border-[#D6CE93] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#EBEBE3] text-[#5A5A40] rounded-xl shrink-0 border border-[#D6D6CC]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-serif font-bold text-[#5A5A40] text-base">Modo de Armazenamento Local Provisório</h4>
                <p className="text-xs text-[#7A7A6A] leading-normal max-w-2xl">
                  As informações estão salvas no navegador local (localStorage). Para integrá-las ao seu banco de dados Supabase real para o deploy no GitHub/Vercel, sintonize suas credenciais clicando adiante.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-semibold text-xs rounded-full transition-all shrink-0 shadow-sm"
            >
              Conectar Supabase
            </button>
          </div>
        )}

        {/* Dashboard Quick Stats */}
        <StatsSection agencias={agencias} />

        {/* Primary Workspace List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-[#5A5A40] text-xl tracking-tight">
              Lista de Agências Parceiras
            </h3>
            <span className="text-xs text-[#A3A380] font-bold tracking-wider uppercase bg-white border border-[#E6E6E1] px-3 py-1 rounded-full">
              {agencias.length} Registradas
            </span>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-3xl border border-[#E6E6E1] p-24 flex flex-col items-center justify-center space-y-4">
              <span className="relative flex h-8 w-8">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A3A380] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-8 w-8 bg-[#5A5A40] flex items-center justify-center text-white font-semibold">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </span>
              </span>
              <p className="text-xs text-[#7A7A6A] font-medium font-serif italic">Carregando agências de turismo...</p>
            </div>
          ) : (
            <AgenciaList 
              agencias={agencias}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>

        {/* Developer Guide Box */}
        <div className="bg-[#EBEBE3] border border-[#D6D6CC] text-[#2D2D2A] rounded-3xl p-6 relative overflow-hidden shadow-sm">
          {/* Ambient bg element */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-[#5A5A40]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#5A5A40]" />
              <h3 className="font-serif font-bold text-lg text-[#5A5A40]">Guia Prático para deploy no Vercel & GitHub</h3>
            </div>
            <p className="text-xs text-[#7A7A6A] leading-relaxed">
              Você deseja enviar este projeto para o GitHub e realizar o deploy na Vercel? Siga estas orientações simples para que o Supabase funcione imediatamente na Vercel:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white/60 p-4 rounded-xl border border-[#D6D6CC]/70 space-y-1.5">
                <strong className="text-[#5A5A40] block font-serif font-semibold flex items-center gap-1.5 text-sm">
                  <span className="w-5 h-5 bg-[#D6D6CC] rounded-full flex items-center justify-center text-[10px] font-bold text-[#5A5A40]">1</span>
                  Setup do Repositório (Git)
                </strong>
                <p className="text-[#7A7A6A]">
                  Suba o código exportado para seu repositório no GitHub. O arquivo <code>.gitignore</code> já impede que suas chaves secretas ou arquivos desnecessários sejam incluídos no histórico público de commits.
                </p>
              </div>

              <div className="bg-white/60 p-4 rounded-xl border border-[#D6D6CC]/70 space-y-1.5">
                <strong className="text-[#5A5A40] block font-serif font-semibold flex items-center gap-1.5 text-sm">
                  <span className="w-5 h-5 bg-[#D6D6CC] rounded-full flex items-center justify-center text-[10px] font-bold text-[#5A5A40]">2</span>
                  Variáveis de Ambiente na Vercel
                </strong>
                <p className="text-[#7A7A6A]">
                  No painel de configuração do seu projeto na Vercel, adicione as chaves: <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>. Elas serão expostas de forma segura ao frontend client do Vite em produção.
                </p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Modal: Supabase Configuration */}
      <SupabaseConfigModal 
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onConfigChanged={handleConfigChanged}
      />

      {/* Modal: Create/Edit Agency form */}
      <AgenciaForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
        editingAgencia={editingAgencia}
      />

      {/* Humble Footer */}
      <footer className="bg-[#EBEBE3] border-t border-[#D6D6CC] py-6 mt-12 text-xs text-[#7A7A6A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-serif italic font-semibold text-[#5A5A40]">Voyage Fluxo</span>
            <span className="ml-2">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#D6D6CC]">|</span>
            <span className="font-semibold text-[#5A5A40] uppercase tracking-wider text-[10px]">Parcerias e Implantação de Turismo Nacional</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
