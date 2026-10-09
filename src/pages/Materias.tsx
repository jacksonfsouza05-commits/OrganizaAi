import { useState } from "react";
import type { Materia, Page } from "../data";
import Header from "../components/Header";

interface MateriasProps {
  materias: Materia[];
  onNavigate: (page: Page) => void;
  onSelectMateria: (m: Materia) => void;
  onAdicionarMateria: (nome: string, cor: string) => Promise<boolean>;
  onExcluirMateria: (id: number) => void;
}

const CORES = ["#7C3AED", "#D97706", "#059669", "#2563EB", "#DC2626", "#DB2777", "#0891B2", "#65A30D", "#9333EA", "#EA580C"];

export default function Materias({ materias, onNavigate, onSelectMateria, onAdicionarMateria, onExcluirMateria }: MateriasProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaCor, setNovaCor] = useState(CORES[0]);
  const [confirmarExcluir, setConfirmarExcluir] = useState<number | null>(null);

  const handleAdicionar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;
    if (!(await onAdicionarMateria(novoNome.trim(), novaCor))) return;
    setNovoNome("");
    setNovaCor(CORES[0]);
    setModalAberto(false);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Matérias" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[#6B7280]">{materias.length} matéria{materias.length !== 1 ? "s" : ""} cadastrada{materias.length !== 1 ? "s" : ""}</p>
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#6D28D9] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M8 3v10M3 8h10"/>
            </svg>
            Nova matéria
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {materias.map(m => {
            const prog = m.atividades > 0 ? Math.round((m.concluidas / m.atividades) * 100) : 0;
            return (
              <div
                key={m.id}
                className="bg-white rounded-xl border border-[#DDD6FE] p-5 hover:shadow-md hover:border-[#A78BFA] transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: m.cor }}>
                      {m.nome.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-[#1E1B2E]">{m.nome}</h3>
                      <p className="text-xs text-[#6B7280]">{m.conteudos} conteúdos · {m.atividades} atividades</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmarExcluir(m.id)}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-md text-[#9CA3AF] hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M3 5h10M6 5V3h4v2M7 8v4M9 8v4M4 5l1 9h6l1-9"/>
                    </svg>
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-[#6B7280]">Progresso</span>
                    <span className="text-xs font-semibold" style={{ color: m.cor }}>{prog}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#F0EDF9] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${prog}%`, backgroundColor: m.cor }} />
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-1">{m.concluidas} de {m.atividades} atividades concluídas</p>
                </div>

                <button
                  onClick={() => { onSelectMateria(m); onNavigate("resumo-materia"); }}
                  className="w-full py-2.5 border-2 border-[#EDE9FE] text-[#7C3AED] rounded-lg text-sm font-semibold hover:bg-[#7C3AED] hover:text-white hover:border-[#7C3AED] transition-all"
                >
                  Acessar matéria →
                </button>
              </div>
            );
          })}

          {/* Add card */}
          <button
            onClick={() => setModalAberto(true)}
            className="bg-white rounded-xl border-2 border-dashed border-[#DDD6FE] p-5 flex flex-col items-center justify-center gap-3 text-[#9CA3AF] hover:border-[#7C3AED] hover:text-[#7C3AED] hover:bg-[#F5F3FF] transition-all min-h-[200px]"
          >
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 5v10M5 10h10"/>
              </svg>
            </div>
            <span className="text-sm font-medium">Adicionar matéria</span>
          </button>
        </div>
      </div>

      {/* Add modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-lg text-[#1E1B2E] mb-4">Nova matéria</h3>
            <form onSubmit={handleAdicionar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Nome da matéria</label>
                <input
                  value={novoNome}
                  onChange={e => setNovoNome(e.target.value)}
                  placeholder="Ex: Filosofia, Arte, Educação Física..."
                  className="w-full px-4 py-2.5 rounded-lg border border-[#DDD6FE] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1E1B2E] mb-2">Cor</label>
                <div className="flex gap-2 flex-wrap">
                  {CORES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNovaCor(c)}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c,
                        boxShadow: novaCor === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : "none"
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 py-2.5 bg-[#7C3AED] text-white rounded-lg text-sm font-semibold hover:bg-[#6D28D9]">
                  Adicionar
                </button>
                <button type="button" onClick={() => setModalAberto(false)} className="flex-1 py-2.5 border border-[#DDD6FE] text-[#6B7280] rounded-lg text-sm hover:bg-[#F5F3FF]">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmarExcluir !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EF4444" strokeWidth="2">
                <path d="M10 6v5M10 15v.5"/>
              </svg>
            </div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-lg text-[#1E1B2E] mb-2">Excluir matéria?</h3>
            <p className="text-sm text-[#6B7280] mb-5">Todos os dados relacionados serão removidos.</p>
            <div className="flex gap-2">
              <button onClick={() => { onExcluirMateria(confirmarExcluir); setConfirmarExcluir(null); }} className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">
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
