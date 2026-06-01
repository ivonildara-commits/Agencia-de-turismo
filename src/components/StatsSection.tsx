import React from 'react';
import { Agencia } from '../types';
import { Clock, PlayCircle, CheckCircle, Compass } from 'lucide-react';

interface StatsSectionProps {
  agencias: Agencia[];
}

export default function StatsSection({ agencias }: StatsSectionProps) {
  const total = agencias.length;
  const naoIniciado = agencias.filter((a) => a.status === 'nao_iniciado').length;
  const emAndamento = agencias.filter((a) => a.status === 'em_andamento').length;
  const concluido = agencias.filter((a) => a.status === 'concluido').length;

  const percentConcluido = total > 0 ? Math.round((concluido / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Card */}
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-[#E6E6E1] flex items-center justify-between hover:shadow-md transition-all">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#A3A380] uppercase tracking-wider block">Registradas</span>
          <h3 className="text-4xl font-serif text-[#5A5A40] tracking-tight">{total}</h3>
          <span className="text-[11px] text-[#7A7A6A] block">Total de parceiras</span>
        </div>
        <div className="p-3 bg-[#EBEBE3] text-[#5A5A40] rounded-2xl">
          <Compass className="w-6 h-6" />
        </div>
      </div>

      {/* Não Iniciado Card */}
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-[#E6E6E1] flex items-center justify-between hover:shadow-md transition-all">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#A3A380] uppercase tracking-wider block">Não Iniciado</span>
          <h3 className="text-4xl font-serif text-red-650 tracking-tight" style={{ color: '#b91c1c' }}>{naoIniciado}</h3>
          <span className="text-[11px] text-[#7A7A6A] block font-medium">Aguardando início</span>
        </div>
        <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* Em Andamento Card */}
      <div className="bg-[#F5F5ED] p-6 rounded-3xl shadow-sm border border-[#D6CE93] ring-1 ring-[#D6CE93]/30 flex items-center justify-between hover:shadow-md transition-all">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#A3A380] uppercase tracking-wider block">Em Andamento</span>
          <h3 className="text-4xl font-serif text-[#5A5A40] tracking-tight">{emAndamento}</h3>
          <span className="text-[11px] text-[#5A5A40]/85 block font-medium">Processando dados</span>
        </div>
        <div className="p-3 bg-[#EBEBE3] text-[#5A5A40] rounded-2xl">
          <PlayCircle className="w-6 h-6 animate-pulse" />
        </div>
      </div>

      {/* Concluído Card */}
      <div className="bg-[#5A5A40] p-6 rounded-3xl shadow-md border border-[#5A5A40] flex items-center justify-between hover:scale-[1.01] transition-all">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#D6CE93] uppercase tracking-wider block">Concluído</span>
          <h3 className="text-4xl font-serif text-white tracking-tight">{concluido}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-bold text-emerald-800 bg-[#EBEBE3] px-1.5 py-0.5 rounded-md">
              {percentConcluido}% taxa
            </span>
            <span className="text-[11px] text-[#FAF9F5]/80">Meta atingida</span>
          </div>
        </div>
        <div className="p-3 bg-white/10 text-white rounded-2xl">
          <CheckCircle className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
