import type { Atividade, Materia, Page } from "../data";
import { formatDate, daysUntil, statusLabel } from "../data";
import Header from "../components/Header";
import { useSessao } from "../session";

interface DashboardProps {
  atividades: Atividade[];
  materias: Materia[];
  onNavigate: (page: Page) => void;
  onConcluir: (id: number) => void;
}

const dataHoje = () => {
  const t = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return t.charAt(0).toUpperCase() + t.slice(1);
};

export default function Dashboard({ atividades, materias, onNavigate, onConcluir }: DashboardProps) {
  const { estudante } = useSessao();
  const pendentes = atividades.filter(a => a.status !== "concluida");
  const concluidas = atividades.filter(a => a.status === "concluida");
  const proximasPrazo = atividades.filter(a => a.status === "prazo-proximo");
  const hoje = atividades.filter(a => {
    const dias = daysUntil(a.prazo);
    return dias === 0 && a.status !== "concluida";
  });

  const progressoGeral = atividades.length ? Math.round((concluidas.length / atividades.length) * 100) : 0;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Início"
        subtitle={dataHoje()}
        onAddAtividade={() => onNavigate("adicionar-atividade")}
      />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Greeting */}
        <div className="mb-6">
          <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-2xl font-bold text-[#1E1B2E]">
            Olá, {estudante.nome.split(" ")[0]}! 👋
          </h2>
          <p className="text-[#6B7280] text-sm mt-0.5">Aqui está um resumo das suas atividades de hoje.</p>
        </div>

        {/* Alert */}
        {proximasPrazo.length > 0 && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {proximasPrazo.length} atividade{proximasPrazo.length > 1 ? "s" : ""} próxima{proximasPrazo.length > 1 ? "s" : ""} do prazo
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                {proximasPrazo.map(a => a.nome).join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Pendentes", value: pendentes.length, color: "#F59E0B", bg: "#FFFBEB", icon: "⏳" },
            { label: "Concluídas", value: concluidas.length, color: "#10B981", bg: "#F0FDF4", icon: "✅" },
            { label: "Prazo próximo", value: proximasPrazo.length, color: "#EF4444", bg: "#FEF2F2", icon: "🚨" },
            { label: "Para hoje", value: hoje.length, color: "#7C3AED", bg: "#F5F3FF", icon: "📅" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#DDD6FE] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{s.icon}</span>
                <span className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: s.color }}>{s.value}</span>
              </div>
              <p className="text-xs text-[#6B7280] font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming activities */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#DDD6FE] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-semibold text-[#1E1B2E]">Próximas do prazo</h3>
              <button onClick={() => onNavigate("atividades")} className="text-xs text-[#7C3AED] hover:underline font-medium">Ver todas</button>
            </div>
            <div className="space-y-3">
              {[...proximasPrazo, ...pendentes.filter(a => a.status !== "prazo-proximo")].slice(0, 5).map(a => {
                const dias = daysUntil(a.prazo);
                return (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F5F3FF] cursor-pointer group transition-colors">
                    <button
                      onClick={() => onConcluir(a.id)}
                      className="w-5 h-5 rounded-full border-2 border-[#DDD6FE] group-hover:border-[#7C3AED] flex-shrink-0 flex items-center justify-center hover:bg-[#7C3AED] transition-colors"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1E1B2E] truncate">{a.nome}</p>
                      <p className="text-xs text-[#6B7280]">{a.materia}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium" style={{ color: dias <= 3 ? "#EF4444" : dias <= 7 ? "#F59E0B" : "#6B7280" }}>
                        {dias === 0 ? "Hoje" : dias < 0 ? "Atrasada" : `${dias}d`}
                      </p>
                      <p className="text-xs text-[#6B7280]">{formatDate(a.prazo)}</p>
                    </div>
                  </div>
                );
              })}
              {pendentes.length === 0 && (
                <div className="text-center py-6 text-[#6B7280] text-sm">
                  🎉 Nenhuma atividade pendente!
                </div>
              )}
            </div>
          </div>

          {/* Progress panel */}
          <div id="progresso" className="bg-white rounded-xl border border-[#DDD6FE] p-5">
            <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-semibold text-[#1E1B2E] mb-4">Progresso geral</h3>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#6B7280]">Atividades concluídas</span>
                <span className="text-sm font-bold text-[#7C3AED]" style={{ fontFamily: "'Outfit', sans-serif" }}>{progressoGeral}%</span>
              </div>
              <div className="w-full h-2.5 bg-[#EDE9FE] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] rounded-full transition-all"
                  style={{ width: `${progressoGeral}%` }}
                />
              </div>
              <p className="text-xs text-[#6B7280] mt-1">{concluidas.length} de {atividades.length} atividades</p>
            </div>
            <div className="space-y-3">
              {materias.slice(0, 5).map(m => {
                const prog = m.atividades > 0 ? Math.round((m.concluidas / m.atividades) * 100) : 0;
                return (
                  <div key={m.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[#1E1B2E]">{m.nome}</span>
                      <span className="text-xs text-[#6B7280]">{prog}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F0EDF9] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${prog}%`, backgroundColor: m.cor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick access */}
        <div className="mt-6 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] rounded-xl p-5 flex items-center justify-between">
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-semibold text-white text-lg">Adicionar nova atividade</h3>
            <p className="text-white/70 text-sm mt-0.5">Registre manualmente ou importe um arquivo</p>
          </div>
          <button
            onClick={() => onNavigate("adicionar-atividade")}
            className="px-5 py-2.5 bg-white text-[#7C3AED] rounded-lg font-semibold text-sm hover:bg-[#F5F3FF] transition-colors flex-shrink-0"
          >
            + Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
