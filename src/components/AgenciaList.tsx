import React, { useState } from 'react';
import { Agencia, StatusAgencia } from '../types';
import { 
  Building2, Search, Filter, Phone, Mail, MapPin, Globe, 
  Trash2, Edit, CheckCircle, Clock, PlayCircle, MoreVertical, 
  ExternalLink, Calendar, Briefcase, Eye, ChevronDown, RefreshCw 
} from 'lucide-react';

interface AgenciaListProps {
  agencias: Agencia[];
  onEdit: (agencia: Agencia) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: StatusAgencia) => void;
}

export default function AgenciaList({ agencias, onEdit, onDelete, onStatusChange }: AgenciaListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | StatusAgencia>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Extract all unique specialties for the select filter
  const specialties = ['all', ...Array.from(new Set(agencias.map(a => a.especialidade).filter(Boolean)))];

  // Filter logic
  const filteredAgencias = agencias.filter((agencia) => {
    const matchesSearch = 
      agencia.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agencia.cnpj && agencia.cnpj.includes(searchTerm)) ||
      (agencia.cidade && agencia.cidade.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (agencia.contato_nome && agencia.contato_nome.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || agencia.status === statusFilter;
    const matchesSpecialty = specialtyFilter === 'all' || agencia.especialidade === specialtyFilter;

    return matchesSearch && matchesStatus && matchesSpecialty;
  });

  const getStatusBadge = (status: StatusAgencia) => {
    switch (status) {
      case 'nao_iniciado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-[#EBEBE3] text-[#7A7A6A] border border-[#D6D6CC]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7A7A6A]" />
            NÃO INICIADO
          </span>
        );
      case 'em_andamento':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-[#F5F5ED] text-[#A3A380] border border-[#D6CE93]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A3A380] animate-pulse" />
            EM ANDAMENTO
          </span>
        );
      case 'concluido':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-[#5A5A40] text-white border border-[#5A5A40]">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            CONCLUÍDO
          </span>
        );
    }
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Strip */}
      <div className="bg-[#EBEBE3] p-5 rounded-3xl border border-[#D6D6CC] shadow-xs flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full lg:max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7A6A]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar agência, CNPJ, cidade, representante..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#D6D6CC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40] text-[#2D2D2A]"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Status Select Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#7A7A6A] font-bold uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3.5 py-2 border border-[#D6D6CC] rounded-xl text-xs font-bold bg-white text-[#5A5A40] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
            >
              <option value="all">Todos os Status</option>
              <option value="nao_iniciado">Não Iniciado</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
            </select>

            {/* Specialty Select */}
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="px-3.5 py-2 border border-[#D6D6CC] rounded-xl text-xs font-bold bg-white text-[#5A5A40] focus:outline-none"
            >
              <option value="all">Todas Especialidades</option>
              {specialties.filter(s => s !== 'all').map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Agency List Result */}
      {filteredAgencias.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-[#D6D6CC] p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 bg-[#EBEBE3] text-[#5A5A40] rounded-2xl flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-[#5A5A40] text-lg">Nenhuma agência encontrada</h4>
            <p className="text-xs text-[#7A7A6A] mt-1 max-w-xs mx-auto leading-relaxed">
              Tente redefinir seus filtros de busca ou cadastrar uma nova agência de turismo para obter resultados.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setSpecialtyFilter('all');
            }}
            className="px-5 py-2 text-xs font-bold text-[#5A5A40] bg-[#EBEBE3] hover:bg-[#DEDECF] rounded-full transition-colors"
          >
            Limpar Todos os Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAgencias.map((agencia) => (
            <div 
              key={agencia.id}
              className="bg-white rounded-3xl border border-[#E6E6E1] shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4 relative overflow-hidden group"
            >
              {/* Highlight ribbon based on status */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                agencia.status === 'nao_iniciado' ? 'bg-[#EBEBE3]' :
                agencia.status === 'em_andamento' ? 'bg-[#D6CE93]' :
                'bg-[#5A5A40]'
              }`} />

              {/* Top Row: Title, Menu, Status */}
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#5A5A40] bg-[#EBEBE3] px-2.5 py-1 rounded-md inline-block">
                      {agencia.especialidade}
                    </span>
                    <h3 className="font-serif font-bold text-[#5A5A40] text-lg group-hover:text-[#4a4a34] transition-colors leading-tight">
                      {agencia.nome}
                    </h3>
                  </div>
                  
                  {/* Actions Dropdown Button */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === agencia.id ? null : agencia.id)}
                      className="p-1.5 rounded-lg hover:bg-[#F5F5ED] text-[#7A7A6A] hover:text-[#5A5A40] transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === agencia.id && (
                      <>
                        {/* Overlay to close menu */}
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                        
                        <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-[#D6D6CC] py-1.5 z-20 text-xs">
                          <button
                            onClick={() => {
                              onEdit(agencia);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-[#FAF9F5] text-[#2D2D2A] flex items-center gap-2"
                          >
                            <Edit className="w-3.5 h-3.5 text-blue-500" />
                            Editar Cadastro
                          </button>
                          
                          {/* Quick change status divider */}
                          <div className="border-t border-[#F5F5F0] my-1 px-3 py-1 font-bold text-[9px] uppercase text-[#A3A380] tracking-wider">
                            Alterar Status
                          </div>

                          <button
                            onClick={() => {
                              onStatusChange(agencia.id, 'nao_iniciado');
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3.5 py-1.5 hover:bg-[#FAF9F5] text-[#2D2D2A] flex items-center gap-2"
                          >
                            <span className="w-2 h-2 rounded-full bg-[#7A7A6A]" />
                            Não Iniciado
                          </button>

                          <button
                            onClick={() => {
                              onStatusChange(agencia.id, 'em_andamento');
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3.5 py-1.5 hover:bg-[#FAF9F5] text-[#2D2D2A] flex items-center gap-2"
                          >
                            <span className="w-2 h-2 rounded-full bg-[#D6CE93]" />
                            Em Andamento
                          </button>

                          <button
                            onClick={() => {
                              onStatusChange(agencia.id, 'concluido');
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3.5 py-1.5 hover:bg-[#FAF9F5] text-[#2D2D2A] flex items-center gap-2"
                          >
                            <span className="w-2 h-2 rounded-full bg-[#5A5A40]" />
                            Concluído
                          </button>

                          <div className="border-t border-[#F5F5F0] my-1" />

                          <button
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir esta agência?')) {
                                onDelete(agencia.id);
                              }
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Excluir Agência
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center text-xs">
                  {getStatusBadge(agencia.status)}
                  {agencia.cnpj && (
                    <span className="text-[#7A7A6A] font-mono text-[11px] bg-[#FAF9F5] border border-[#D6D6CC] px-2 py-0.5 rounded-md">
                      {agencia.cnpj}
                    </span>
                  )}
                </div>
              </div>

              {/* Description section (optional but looks great) */}
              {agencia.descricao && (
                <p className="text-xs text-[#7A7A6A] leading-relaxed line-clamp-2 italic">
                  &ldquo;{agencia.descricao}&rdquo;
                </p>
              )}

              {/* Detail fields mapping (Location, Contact) */}
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-[#F5F5F0] pt-3 text-[#7A7A6A]">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[#A3A380]">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Localidade</span>
                  </div>
                  <p className="font-semibold text-[#2D2D2A] pl-5 text-[13px]">
                    {agencia.cidade || 'Não informada'}{agencia.estado ? `, ${agencia.estado}` : ''}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[#A3A380]">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Contato Direto</span>
                  </div>
                  <p className="font-semibold text-[#2D2D2A] pl-5 text-[13px] truncate" title={agencia.contato_nome || agencia.contato_telefone}>
                    {agencia.contato_telefone || agencia.contato_nome || 'Não informado'}
                  </p>
                </div>
              </div>

              {/* Footer strip: website URL, registration date */}
              <div className="flex items-center justify-between border-t border-[#F5F5F0] pt-3 text-[11px] text-[#A3A380]">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Cadastrada {formatDate(agencia.created_at)}</span>
                </div>

                {agencia.website ? (
                  <a
                    href={`https://${agencia.website.replace(/^https?:\/\//i, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#5A5A40] hover:text-[#4a4a34] font-serif font-bold italic flex items-center gap-1 group/link"
                  >
                    <span>Acessar Site</span>
                    <ExternalLink className="w-3 h-3 font-medium transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </a>
                ) : (
                  <span className="text-[#A3A380]/70 italic">Sem Website</span>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
