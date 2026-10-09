import { useState } from "react";
import type { Atividade } from "../data";
import { formatDate, statusLabel } from "../data";
import Header from "../components/Header";

interface CalendarioProps {
  atividades: Atividade[];
}

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

export default function Calendario({ atividades }: CalendarioProps) {
  const [ano, setAno] = useState(() => new Date().getFullYear());
  const [mes, setMes] = useState(() => new Date().getMonth());
  const [detalhe, setDetalhe] = useState<Atividade | null>(null);

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  const atividadesDia = (dia: number) => {
    const dateStr = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    return atividades.filter(a => a.prazo === dateStr);
  };

  const statusColors: Record<string, string> = {
    pendente: "bg-[#EDE9FE] text-[#7C3AED]",
    concluida: "bg-green-100 text-green-700",
    "prazo-proximo": "bg-amber-100 text-amber-700",
  };

  const statusDot: Record<string, string> = {
    pendente: "bg-[#7C3AED]",
    concluida: "bg-green-500",
    "prazo-proximo": "bg-amber-400",
  };

  const hoje = new Date();
  const isHoje = (dia: number) => ano === hoje.getFullYear() && mes === hoje.getMonth() && dia === hoje.getDate();

  return (
    <div className="flex flex-col h-full">
      <Header title="Calendário" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex gap-5">
          {/* Calendar */}
          <div className="flex-1 bg-white rounded-xl border border-[#DDD6FE] p-5">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => { if (mes === 0) { setMes(11); setAno(a => a - 1); } else setMes(m => m - 1); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#EDE9FE] hover:text-[#7C3AED]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 3L5 8l5 5"/>
                </svg>
              </button>
              <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-[#1E1B2E] text-lg">
                {MESES[mes]} {ano}
              </h3>
              <button
                onClick={() => { if (mes === 11) { setMes(0); setAno(a => a + 1); } else setMes(m => m + 1); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#EDE9FE] hover:text-[#7C3AED]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 3l5 5-5 5"/>
                </svg>
              </button>
            </div>

            {/* Days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-[#9CA3AF] py-1.5">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: primeiroDia }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: diasNoMes }, (_, i) => i + 1).map(dia => {
                const ats = atividadesDia(dia);
                const hoje = isHoje(dia);
                return (
                  <div
                    key={dia}
                    className={`min-h-[72px] rounded-lg p-1.5 border transition-colors ${
                      hoje
                        ? "border-[#7C3AED] bg-[#F5F3FF]"
                        : ats.length > 0
                        ? "border-[#DDD6FE] bg-[#FAFAFA] hover:bg-[#F5F3FF] cursor-pointer"
                        : "border-transparent hover:bg-[#FAFAFA]"
                    }`}
                  >
                    <div className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                      hoje ? "bg-[#7C3AED] text-white" : "text-[#374151]"
                    }`}>
                      {dia}
                    </div>
                    <div className="space-y-0.5">
                      {ats.slice(0, 2).map((a, i) => (
                        <button
                          key={i}
                          onClick={() => setDetalhe(a)}
                          className={`w-full text-left text-xs px-1.5 py-0.5 rounded truncate font-medium ${statusColors[a.status]}`}
                        >
                          {a.nome.split("—")[0].trim()}
                        </button>
                      ))}
                      {ats.length > 2 && (
                        <div className="text-xs text-[#9CA3AF] px-1">+{ats.length - 2}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-[#F0EDF9]">
              {[
                { label: "Pendente", color: "bg-[#7C3AED]" },
                { label: "Prazo próximo", color: "bg-amber-400" },
                { label: "Concluída", color: "bg-green-500" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                  <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar list */}
          <div className="w-64 space-y-3">
            <div className="bg-white rounded-xl border border-[#DDD6FE] p-4">
              <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-semibold text-[#1E1B2E] mb-3 text-sm">
                Atividades de {MESES[mes]}
              </h3>
              {atividades.filter(a => {
                const [ay, am] = a.prazo.split("-");
                return parseInt(ay) === ano && parseInt(am) - 1 === mes;
              }).length === 0 ? (
                <p className="text-xs text-[#9CA3AF]">Nenhuma atividade neste mês</p>
              ) : (
                <div className="space-y-2">
                  {atividades
                    .filter(a => { const [ay, am] = a.prazo.split("-"); return parseInt(ay) === ano && parseInt(am) - 1 === mes; })
                    .sort((a, b) => a.prazo.localeCompare(b.prazo))
                    .map(a => (
                      <button
                        key={a.id}
                        onClick={() => setDetalhe(a)}
                        className="w-full text-left flex items-start gap-2 p-2 rounded-lg hover:bg-[#F5F3FF] transition-colors"
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${statusDot[a.status]}`} />
                        <div>
                          <p className="text-xs font-medium text-[#1E1B2E] truncate">{a.nome}</p>
                          <p className="text-xs text-[#9CA3AF]">{a.materia} · {formatDate(a.prazo)}</p>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {detalhe && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDetalhe(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-lg text-[#1E1B2E]">{detalhe.nome}</h3>
                <p className="text-sm text-[#6B7280]">{detalhe.materia}</p>
              </div>
              <button onClick={() => setDetalhe(null)} className="text-[#9CA3AF] hover:text-[#6B7280]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5l10 10M15 5L5 15"/></svg>
              </button>
            </div>
            <p className="text-sm text-[#374151] mb-4">{detalhe.descricao}</p>
            <div className="flex gap-3">
              <div className="flex-1 bg-[#F5F3FF] rounded-lg p-3">
                <p className="text-xs text-[#6B7280]">Prazo</p>
                <p className="text-sm font-semibold text-[#1E1B2E]">{formatDate(detalhe.prazo)}</p>
              </div>
              <div className="flex-1 bg-[#F5F3FF] rounded-lg p-3">
                <p className="text-xs text-[#6B7280]">Status</p>
                <p className="text-sm font-semibold text-[#1E1B2E]">{statusLabel[detalhe.status]}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
