import { useEffect, useState } from "react";
import type { Conteudo, Materia, Page } from "../data";
import { api } from "../api";
import Header from "../components/Header";

interface ResumoMateriaProps {
  materia: Materia | null;
  onNavigate: (page: Page) => void;
  onMudou: () => void;
}

const campo = "w-full px-4 py-2.5 rounded-lg border border-[#DDD6FE] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent";

export default function ResumoMateria({ materia, onNavigate, onMudou }: ResumoMateriaProps) {
  const [conteudos, setConteudos] = useState<Conteudo[] | null>(null);
  const [conteudoIdx, setConteudoIdx] = useState(0);
  const [explicacaoSimples, setExplicacaoSimples] = useState(false);
  const [modalNovo, setModalNovo] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [topicos, setTopicos] = useState("");
  const [simples, setSimples] = useState("");
  const [erro, setErro] = useState("");

  const materiaId = materia?.id;

  useEffect(() => {
    if (!materiaId) return;
    setConteudos(null);
    setConteudoIdx(0);
    api.conteudos(materiaId).then(setConteudos).catch(() => setConteudos([]));
  }, [materiaId]);

  if (!materia) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Resumo" />
        <div className="flex-1 flex items-center justify-center text-[#6B7280]">Nenhuma matéria selecionada</div>
      </div>
    );
  }

  const lista = conteudos || [];
  const atual = lista[conteudoIdx];
  const totalEstudados = lista.filter(c => c.estudado).length;

  const alternarEstudado = async () => {
    if (!atual) return;
    try {
      const r = await api.marcarEstudado(atual.id, !atual.estudado);
      setConteudos(prev => (prev || []).map(c => c.id === r.id ? { ...c, estudado: r.estudado } : c));
      onMudou();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu pra salvar");
    }
  };

  const salvarConteudo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    try {
      const novo = await api.criarConteudo(materia.id, {
        titulo,
        resumo,
        topicos: topicos.split("\n"),
        explicacaoSimples: simples,
      });
      const proximo = [...lista, novo];
      setConteudos(proximo);
      setConteudoIdx(proximo.length - 1);
      setExplicacaoSimples(false);
      setModalNovo(false);
      setTitulo(""); setResumo(""); setTopicos(""); setSimples("");
      onMudou();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu pra salvar");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title={materia.nome} subtitle="Resumo de conteúdo" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back + nav */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => onNavigate("materias")}
              className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#7C3AED] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M10 3L5 8l5 5"/>
              </svg>
              Matérias
            </button>
            <span className="text-[#DDD6FE]">/</span>
            <span className="text-sm font-medium text-[#1E1B2E]">{materia.nome}</span>
          </div>

          {/* Content tabs */}
          {(
            <div className="flex gap-2 mb-5 overflow-x-auto">
              {lista.map((c, i) => (
                <button
                  key={i}
                  onClick={() => { setConteudoIdx(i); setExplicacaoSimples(false); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2 ${
                    conteudoIdx === i ? "bg-[#7C3AED] text-white" : "bg-white border border-[#DDD6FE] text-[#6B7280] hover:bg-[#EDE9FE]"
                  }`}
                >
                  {c.estudado && <span className="text-green-400">✓</span>}
                  {c.titulo}
                </button>
              ))}
              <button
                onClick={() => { setErro(""); setModalNovo(true); }}
                className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap border border-dashed border-[#A78BFA] text-[#7C3AED] hover:bg-[#EDE9FE]"
              >
                + Novo conteúdo
              </button>
            </div>
          )}

          {conteudos === null && <p className="text-sm text-[#6B7280]">Carregando...</p>}

          {conteudos !== null && !atual && (
            <div className="bg-white rounded-xl border border-[#DDD6FE] p-10 text-center">
              <p className="text-sm font-medium text-[#1E1B2E]">Nenhum conteúdo em {materia.nome} ainda</p>
              <p className="text-xs text-[#6B7280] mt-1">Adicione um resumo pra começar a estudar.</p>
            </div>
          )}

          {atual && <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-[#DDD6FE] p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: materia.cor }} />
                      <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">Resumo</span>
                    </div>
                    <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-xl font-bold text-[#1E1B2E]">{atual.titulo}</h2>
                  </div>
                  {atual.estudado && (
                    <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full font-medium">
                      ✓ Estudado
                    </span>
                  )}
                </div>

                {/* Toggle */}
                <div className="flex gap-1 p-1 bg-[#F5F3FF] rounded-lg mb-4 w-fit">
                  <button
                    onClick={() => setExplicacaoSimples(false)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${!explicacaoSimples ? "bg-white text-[#7C3AED] shadow-sm" : "text-[#6B7280] hover:text-[#7C3AED]"}`}
                  >
                    Resumo completo
                  </button>
                  <button
                    onClick={() => setExplicacaoSimples(true)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${explicacaoSimples ? "bg-white text-[#7C3AED] shadow-sm" : "text-[#6B7280] hover:text-[#7C3AED]"}`}
                  >
                    ✨ Explicação simples
                  </button>
                </div>

                {!explicacaoSimples ? (
                  <div>
                    <p className="text-sm text-[#374151] leading-relaxed">{atual.resumo}</p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] rounded-xl p-5 border border-[#DDD6FE]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">✨</span>
                      <span style={{ fontFamily: "'Outfit', sans-serif" }} className="font-semibold text-[#7C3AED] text-sm">Explicação simplificada</span>
                    </div>
                    <p className="text-sm text-[#374151] leading-relaxed">{atual.explicacaoSimples || "Esse conteúdo ainda não tem uma explicação simples."}</p>
                  </div>
                )}

                <div className="mt-5 pt-5 border-t border-[#F0EDF9] flex gap-3">
                  <button
                    onClick={() => setExplicacaoSimples(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-[#7C3AED] text-[#7C3AED] rounded-lg text-sm font-medium hover:bg-[#7C3AED] hover:text-white transition-all"
                  >
                    ✨ Explicar de forma simples
                  </button>
                  <button
                    onClick={alternarEstudado}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      atual.estudado
                        ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-50"
                        : "bg-[#F5F3FF] text-[#6B7280] border border-[#DDD6FE] hover:border-[#7C3AED] hover:text-[#7C3AED]"
                    }`}
                  >
                    {atual.estudado ? "✓ Marcado como estudado" : "Marcar como estudado"}
                  </button>
                </div>
              </div>
            </div>

            {/* Topics sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-[#DDD6FE] p-5">
                <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-semibold text-[#1E1B2E] mb-4">Tópicos importantes</h3>
                <ul className="space-y-2.5">
                  {atual.topicos.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#374151]">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs text-white font-bold" style={{ backgroundColor: materia.cor }}>
                        {i + 1}
                      </div>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-[#DDD6FE] p-5">
                <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-semibold text-[#1E1B2E] mb-3">Progresso da matéria</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#6B7280]">Conteúdos estudados</span>
                  <span className="text-xs font-semibold" style={{ color: materia.cor }}>{totalEstudados}/{lista.length}</span>
                </div>
                <div className="w-full h-2 bg-[#F0EDF9] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(totalEstudados / lista.length) * 100}%`, backgroundColor: materia.cor }} />
                </div>
              </div>
            </div>
          </div>}
        </div>
      </div>

      {modalNovo && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalNovo(false)}>
          <form onSubmit={salvarConteudo} onClick={e => e.stopPropagation()} className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-lg text-[#1E1B2E]">Novo conteúdo de {materia.nome}</h3>
            <div>
              <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Título</label>
              <input required value={titulo} onChange={e => setTitulo(e.target.value)} className={campo} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Resumo</label>
              <textarea required rows={4} value={resumo} onChange={e => setResumo(e.target.value)} className={campo + " resize-none"} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Tópicos importantes <span className="text-xs text-[#6B7280] font-normal">(um por linha)</span></label>
              <textarea rows={3} value={topicos} onChange={e => setTopicos(e.target.value)} className={campo + " resize-none"} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Explicação simples <span className="text-xs text-[#6B7280] font-normal">(opcional)</span></label>
              <textarea rows={3} value={simples} onChange={e => setSimples(e.target.value)} className={campo + " resize-none"} />
            </div>
            {erro && <p className="text-sm text-red-600">{erro}</p>}
            <div className="flex gap-3">
              <button type="submit" className="flex-1 py-2.5 bg-[#7C3AED] text-white rounded-lg text-sm font-semibold hover:bg-[#6D28D9]">Salvar</button>
              <button type="button" onClick={() => setModalNovo(false)} className="px-5 py-2.5 border border-[#DDD6FE] text-[#6B7280] rounded-lg text-sm hover:bg-[#F5F3FF]">Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
