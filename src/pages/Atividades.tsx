import { useState } from "react";
import type { Atividade, Page } from "../data";
import { formatDate, daysUntil, statusLabel, prioridadeLabel } from "../data";
import Header from "../components/Header";

interface AtividadesProps {
  atividades: Atividade[];
  onNavigate: (page: Page) => void;
  onConcluir: (id: number) => void;
  onExcluir: (id: number) => void;
  onEditar: (a: Atividade) => void;
}

type Filtro = "todas" | "pendente" | "concluida" | "prazo-proximo";

export default function Atividades({ atividades, onNavigate, onConcluir, onExcluir, onEditar }: AtividadesProps) {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [busca, setBusca] = useState("");
  const [confirmarExcluir, setConfirmarExcluir] = useState<number | null>(null);
  const [detalhe, setDetalhe] = useState<Atividade | null>(null);

  const filtradas = atividades.filter(a => {
    const matchFiltro = filtro === "todas" || a.status === filtro;
    const matchBusca = a.nome.toLowerCase().includes(busca.toLowerCase()) || a.materia.toLowerCase().includes(busca.toLowerCase());
    return matchFiltro && matchBusca;
  });

  const filtros: { key: Filtro; label: string; count: number }[] = [
    { key: "todas", label: "Todas", count: atividades.length },
    { key: "pendente", label: "Pendentes", count: atividades.filter(a => a.status === "pendente").length },
    { key: "prazo-proximo", label: "Prazo próximo", count: atividades.filter(a => a.status === "prazo-proximo").length },
    { key: "concluida", label: "Concluídas", count: atividades.filter(a => a.status === "concluida").length },
  ];

  const statusColors: Record<string, string> = {
    pendente: "bg-[#EDE9FE] text-[#7C3AED]",
    concluida: "bg-green-100 text-green-700",
    "prazo-proximo": "bg-amber-100 text-amber-700",
  };

  const prioridadeColors: Record<string, string> = {
    alta: "bg-red-100 text-red-600",
    media: "bg-amber-100 text-amber-600",
    baixa: "bg-green-100 text-green-600",
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Minhas Atividades" onAddAtividade={() => onNavigate("adicionar-atividade")} />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Search */}
        <div className="relative mb-5">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="9" r="6"/><path d="M15 15l3 3"/>
          </svg>
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar atividade ou matéria..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#DDD6FE] rounded-lg text-sm text-[#1E1B2E] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {filtros.map(f => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filtro === f.key
                  ? "bg-[#7C3AED] text-white"
                  : "bg-white border border-[#DDD6FE] text-[#6B7280] hover:bg-[#EDE9FE] hover:text-[#7C3AED] hover:border-[#7C3AED]"
              }`}
            >
              {f.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filtro === f.key ? "bg-white/20 text-white" : "bg-[#F0EDF9] text-[#7C3AED]"}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#DDD6FE] overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-[#F0EDF9] bg-[#FAFAFA]">
            <div className="col-span-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Atividade</div>
            <div className="col-span-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Matéria</div>
            <div className="col-span-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Prazo</div>
            <div className="col-span-1 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Prior.</div>
            <div className="col-span-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Status</div>
            <div className="col-span-1 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Ações</div>
          </div>
          {filtradas.length === 0 ? (
            <div className="text-center py-12 text-[#6B7280] text-sm">
              <div className="text-3xl mb-2">📋</div>
              Nenhuma atividade encontrada
            </div>
          ) : (
            <div className="divide-y divide-[#F0EDF9]">
              {filtradas.map(a => {
                const dias = daysUntil(a.prazo);
                return (
                  <div key={a.id} className="grid grid-cols-12 gap-4 px-4 py-3.5 hover:bg-[#FAFAFA] transition-colors items-center">
                    <div className="col-span-4">
                      <p className="text-sm font-medium text-[#1E1B2E] truncate">{a.nome}</p>
                      <p className="text-xs text-[#9CA3AF] truncate">{a.descricao}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-[#374151]">{a.materia}</span>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-[#374151]">{formatDate(a.prazo)}</p>
                      {a.status !== "concluida" && (
                        <p className="text-xs" style={{ color: dias <= 3 ? "#EF4444" : dias <= 7 ? "#F59E0B" : "#9CA3AF" }}>
                          {dias < 0 ? "Atrasada" : dias === 0 ? "Hoje" : `${dias}d restantes`}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prioridadeColors[a.prioridade]}`}>
                        {prioridadeLabel[a.prioridade]}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[a.status]}`}>
                        {statusLabel[a.status]}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center gap-1">
                      <button
                        onClick={() => setDetalhe(a)}
                        title="Visualizar"
                        className="w-7 h-7 flex items-center justify-center rounded-md text-[#6B7280] hover:bg-[#EDE9FE] hover:text-[#7C3AED]"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75">
                          <ellipse cx="8" cy="8" rx="6" ry="4"/>
                          <circle cx="8" cy="8" r="2"/>
                        </svg>
                      </button>
                      {a.status !== "concluida" && (
                        <button
                          onClick={() => onConcluir(a.id)}
                          title="Concluir"
                          className="w-7 h-7 flex items-center justify-center rounded-md text-[#6B7280] hover:bg-green-50 hover:text-green-600"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 8l3.5 3.5L13 4"/>
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmarExcluir(a.id)}
                        title="Excluir"
                        className="w-7 h-7 flex items-center justify-center rounded-md text-[#6B7280] hover:bg-red-50 hover:text-red-500"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75">
                          <path d="M3 5h10M6 5V3h4v2M7 8v4M9 8v4M4 5l1 9h6l1-9"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detalhe modal */}
      {detalhe && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDetalhe(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-lg text-[#1E1B2E]">{detalhe.nome}</h3>
                <p className="text-sm text-[#6B7280]">{detalhe.materia}</p>
              </div>
              <button onClick={() => setDetalhe(null)} className="text-[#9CA3AF] hover:text-[#6B7280]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 5l10 10M15 5L5 15"/>
                </svg>
              </button>
            </div>
            <p className="text-sm text-[#374151] mb-4">{detalhe.descricao}</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#F5F3FF] rounded-lg p-3">
                <p className="text-xs text-[#6B7280]">Prazo</p>
                <p className="text-sm font-semibold text-[#1E1B2E]">{formatDate(detalhe.prazo)}</p>
              </div>
              <div className="bg-[#F5F3FF] rounded-lg p-3">
                <p className="text-xs text-[#6B7280]">Prioridade</p>
                <p className="text-sm font-semibold text-[#1E1B2E]">{prioridadeLabel[detalhe.prioridade]}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {detalhe.status !== "concluida" && (
                <button
                  onClick={() => { onConcluir(detalhe.id); setDetalhe(null); }}
                  className="flex-1 py-2.5 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#6D28D9]"
                >
                  Marcar como concluída
                </button>
              )}
              <button onClick={() => setDetalhe(null)} className="flex-1 py-2.5 border border-[#DDD6FE] text-[#6B7280] rounded-lg text-sm hover:bg-[#F5F3FF]">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar exclusão */}
      {confirmarExcluir !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EF4444" strokeWidth="2">
                <path d="M10 6v5M10 14v1M5 5l10 10M15 5L5 15"/>
              </svg>
            </div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-lg text-[#1E1B2E] text-center mb-2">Excluir atividade?</h3>
            <p className="text-sm text-[#6B7280] text-center mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2">
              <button
                onClick={() => { onExcluir(confirmarExcluir); setConfirmarExcluir(null); }}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
              >
                Excluir
              </button>
              <button onClick={() => setConfirmarExcluir(null)} className="flex-1 py-2.5 border border-[#DDD6FE] text-[#6B7280] rounded-lg text-sm hover:bg-[#F5F3FF]">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
