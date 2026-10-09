import { useRef, useState } from "react";
import type { Atividade, Materia, Page, Prioridade } from "../data";
import type { DadosAtividade } from "../api";
import Header from "../components/Header";

interface AdicionarAtividadeProps {
  materias: Materia[];
  onSalvar: (dados: DadosAtividade, id?: number) => Promise<boolean>;
  onNavigate: (page: Page) => void;
  editando?: Atividade | null;
}

export default function AdicionarAtividade({ materias, onSalvar, onNavigate, editando }: AdicionarAtividadeProps) {
  const [modo, setModo] = useState<"manual" | "importar">("manual");
  const [nome, setNome] = useState(editando?.nome || "");
  const [materiaId, setMateriaId] = useState(editando ? String(editando.materiaId) : "");
  const [descricao, setDescricao] = useState(editando?.descricao || "");
  const [prazo, setPrazo] = useState(editando?.prazo || "");
  const [prioridade, setPrioridade] = useState<Prioridade>(editando?.prioridade || "media");
  const [sucesso, setSucesso] = useState(false);

  // Import simulation state
  const [arquivo, setArquivo] = useState<string | null>(null);
  const [importando, setImportando] = useState(false);
  const [importado, setImportado] = useState(false);
  const [nomeImport, setNomeImport] = useState("");
  const [materiaImport, setMateriaImport] = useState("");
  const [prazoImport, setPrazoImport] = useState("");
  const [salvando, setSalvando] = useState(false);
  const inputArquivo = useRef<HTMLInputElement>(null);

  const finalizar = async (dados: DadosAtividade, id?: number) => {
    setSalvando(true);
    const ok = await onSalvar(dados, id);
    setSalvando(false);
    if (!ok) return;
    setSucesso(true);
    setTimeout(() => { setSucesso(false); onNavigate("atividades"); }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !materiaId || !prazo) return;
    finalizar({ nome, materiaId: Number(materiaId), descricao, prazo, prioridade }, editando?.id);
  };

  const handleImportar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeImport || !materiaImport || !prazoImport) return;
    finalizar({
      nome: nomeImport,
      materiaId: Number(materiaImport),
      descricao: `Importada do arquivo ${arquivo}`,
      prazo: prazoImport,
      prioridade: "media",
    });
  };

  const escolherArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setArquivo(f.name);
    const limpo = f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
    setNomeImport(limpo.charAt(0).toUpperCase() + limpo.slice(1));
    setImportando(true);
    setTimeout(() => { setImportando(false); setImportado(true); }, 800);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col h-full">
      <Header title={editando ? "Editar Atividade" : "Adicionar Atividade"} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Mode toggle */}
          {!editando && (
            <div className="flex gap-1 p-1 bg-white rounded-xl border border-[#DDD6FE] mb-6 w-fit">
              {[
                { key: "manual", label: "✏️ Manualmente" },
                { key: "importar", label: "📄 Importar arquivo" },
              ].map(m => (
                <button
                  key={m.key}
                  onClick={() => setModo(m.key as "manual" | "importar")}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                    modo === m.key
                      ? "bg-[#7C3AED] text-white shadow-sm"
                      : "text-[#6B7280] hover:text-[#7C3AED]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}

          {/* Manual form */}
          {(modo === "manual" || editando) && (
            <div className="bg-white rounded-xl border border-[#DDD6FE] p-6">
              <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-lg text-[#1E1B2E] mb-5">
                {editando ? "Editar atividade" : "Nova atividade"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Nome da atividade <span className="text-red-400">*</span></label>
                  <input
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Ex: Lista de exercícios capítulo 4"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#DDD6FE] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Matéria <span className="text-red-400">*</span></label>
                    <select
                      value={materiaId}
                      onChange={e => setMateriaId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#DDD6FE] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent bg-white"
                      required
                    >
                      <option value="">Selecione a matéria</option>
                      {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Data de entrega <span className="text-red-400">*</span></label>
                    <input
                      type="date"
                      value={prazo}
                      onChange={e => setPrazo(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#DDD6FE] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Descrição</label>
                  <textarea
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    placeholder="Descreva os detalhes da atividade..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#DDD6FE] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E1B2E] mb-2">Prioridade</label>
                  <div className="flex gap-3">
                    {(["alta", "media", "baixa"] as Prioridade[]).map(p => {
                      const colors: Record<Prioridade, string> = {
                        alta: prioridade === p ? "border-red-500 bg-red-50 text-red-600" : "border-[#DDD6FE] text-[#6B7280]",
                        media: prioridade === p ? "border-amber-500 bg-amber-50 text-amber-600" : "border-[#DDD6FE] text-[#6B7280]",
                        baixa: prioridade === p ? "border-green-500 bg-green-50 text-green-600" : "border-[#DDD6FE] text-[#6B7280]",
                      };
                      const labels = { alta: "Alta", media: "Média", baixa: "Baixa" };
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPrioridade(p)}
                          className={`flex-1 py-2 border-2 rounded-lg text-sm font-medium transition-all ${colors[p]}`}
                        >
                          {labels[p]}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={salvando}
                    className="flex-1 py-3 bg-[#7C3AED] text-white rounded-lg font-semibold text-sm hover:bg-[#6D28D9] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {sucesso ? (
                      <>✅ {editando ? "Salvo!" : "Adicionada com sucesso!"}</>
                    ) : (
                      editando ? "Salvar alterações" : "Adicionar atividade"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate("atividades")}
                    className="px-6 py-3 border border-[#DDD6FE] text-[#6B7280] rounded-lg text-sm hover:bg-[#F5F3FF]"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Import mode */}
          {modo === "importar" && !editando && (
            <div className="bg-white rounded-xl border border-[#DDD6FE] p-6">
              <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-lg text-[#1E1B2E] mb-2">Importar de arquivo</h2>
              <p className="text-sm text-[#6B7280] mb-5">Envie uma imagem ou PDF com a atividade e o sistema identificará os dados automaticamente.</p>

              {!importado ? (
                <>
                  <input ref={inputArquivo} type="file" accept=".pdf,image/*" className="hidden" onChange={escolherArquivo} />
                  <div
                    onClick={() => inputArquivo.current?.click()}
                    className="border-2 border-dashed border-[#DDD6FE] rounded-xl p-10 text-center cursor-pointer hover:border-[#7C3AED] hover:bg-[#F5F3FF] transition-all"
                  >
                    {importando ? (
                      <div className="flex flex-col items-center gap-3">
                        <svg className="animate-spin w-8 h-8 text-[#7C3AED]" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" opacity="0.3"/>
                          <path d="M12 2a10 10 0 0110 10" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round"/>
                        </svg>
                        <p className="text-sm text-[#7C3AED] font-medium">Analisando arquivo...</p>
                        <p className="text-xs text-[#6B7280]">{arquivo}</p>
                      </div>
                    ) : arquivo ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📄</span>
                        </div>
                        <p className="text-sm font-medium text-[#1E1B2E]">{arquivo}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-[#EDE9FE] rounded-full flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1E1B2E]">Clique para selecionar arquivo</p>
                          <p className="text-xs text-[#6B7280] mt-1">Suporta PDF e imagens (JPG, PNG)</p>
                        </div>
                        <button type="button" className="mt-2 px-5 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#6D28D9]">
                          Selecionar arquivo
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  {/* Success analysis */}
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-5">
                    <span className="text-green-500">✅</span>
                    <p className="text-sm text-green-700 font-medium">Atividade identificada com sucesso!</p>
                    <p className="text-xs text-green-600 ml-auto">{arquivo}</p>
                  </div>
                  <form onSubmit={handleImportar} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Nome identificado</label>
                      <input required value={nomeImport} onChange={e => setNomeImport(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-[#DDD6FE] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Matéria</label>
                        <select value={materiaImport} onChange={e => setMateriaImport(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-[#DDD6FE] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white">
                          <option value="">Selecione a matéria</option>
                          {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Data de entrega</label>
                        <input type="date" required value={prazoImport} onChange={e => setPrazoImport(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-[#DDD6FE] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"/>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={salvando} className="flex-1 py-3 bg-[#7C3AED] text-white rounded-lg font-semibold text-sm hover:bg-[#6D28D9] disabled:opacity-70">
                        {sucesso ? "✅ Adicionada!" : "Adicionar atividade"}
                      </button>
                      <button type="button" onClick={() => { setImportado(false); setArquivo(null); }} className="px-5 py-3 border border-[#DDD6FE] text-[#6B7280] rounded-lg text-sm hover:bg-[#F5F3FF]">
                        Novo arquivo
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
