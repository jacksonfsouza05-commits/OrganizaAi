import { useState } from "react";
import { api } from "../api";
import { useSessao } from "../session";
import Header from "../components/Header";

function haQuantoTempo(iso: string) {
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias <= 0) return "hoje";
  return dias === 1 ? "há 1 dia" : `há ${dias} dias`;
}

export default function Configuracoes() {
  const { estudante, setEstudante } = useSessao();
  const [nome, setNome] = useState(estudante.nome);
  const email = estudante.email;
  const [notifPrazo, setNotifPrazo] = useState(estudante.notifPrazo);
  const [notifDiario, setNotifDiario] = useState(estudante.notifDiario);
  const [notifSemanal, setNotifSemanal] = useState(estudante.notifSemanal);
  const [antecedencia, setAntecedencia] = useState(String(estudante.antecedencia));
  const [senhaModal, setSenhaModal] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState("");
  const [erroSenha, setErroSenha] = useState("");

  const handleSave = async () => {
    setErro("");
    try {
      const e = await api.salvarPerfil({
        nome, notifPrazo, notifDiario, notifSemanal, antecedencia: Number(antecedencia),
      });
      setEstudante(e);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2000);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não deu pra salvar");
    }
  };

  const trocarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroSenha("");
    try {
      await api.trocarSenha(senhaAtual, novaSenha);
      setEstudante({ ...estudante, senhaAlteradaEm: new Date().toISOString() });
      setSenhaModal(false);
      setSenhaAtual("");
      setNovaSenha("");
    } catch (err) {
      setErroSenha(err instanceof Error ? err.message : "Não deu pra trocar a senha");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Configurações" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Profile */}
          <div className="bg-white rounded-xl border border-[#DDD6FE] p-6">
            <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-[#1E1B2E] mb-4">Informações da conta</h2>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center text-white text-2xl font-bold">
                {nome.charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <p style={{ fontFamily: "'Outfit', sans-serif" }} className="font-semibold text-[#1E1B2E]">{nome}</p>
                <p className="text-sm text-[#6B7280]">{email}</p>
                <span className="text-xs bg-[#EDE9FE] text-[#7C3AED] px-2 py-0.5 rounded-full font-medium">Estudante</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Nome completo</label>
                <input
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#DDD6FE] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">E-mail</label>
                <input
                  value={email}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-[#DDD6FE] text-sm text-[#9CA3AF] bg-[#F9FAFB] cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl border border-[#DDD6FE] p-6">
            <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-[#1E1B2E] mb-4">Segurança</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#1E1B2E]">Senha</p>
                <p className="text-xs text-[#6B7280]">Última alteração {haQuantoTempo(estudante.senhaAlteradaEm)}</p>
              </div>
              <button
                onClick={() => { setErroSenha(""); setSenhaModal(true); }}
                className="px-4 py-2 border border-[#DDD6FE] text-[#374151] rounded-lg text-sm font-medium hover:bg-[#F5F3FF] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-all"
              >
                Alterar senha
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl border border-[#DDD6FE] p-6">
            <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-[#1E1B2E] mb-4">Notificações</h2>
            <div className="space-y-4">
              {[
                { label: "Alertas de prazo próximo", sub: "Receba avisos quando uma atividade estiver próxima do vencimento", value: notifPrazo, set: setNotifPrazo },
                { label: "Resumo diário", sub: "Receba um resumo das suas atividades pendentes todo dia às 8h", value: notifDiario, set: setNotifDiario },
                { label: "Relatório semanal", sub: "Receba um relatório do seu progresso toda segunda-feira", value: notifSemanal, set: setNotifSemanal },
              ].map((n, i) => (
                <div key={i} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#1E1B2E]">{n.label}</p>
                    <p className="text-xs text-[#6B7280]">{n.sub}</p>
                  </div>
                  <button
                    onClick={() => n.set(!n.value)}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${n.value ? "bg-[#7C3AED]" : "bg-[#D1D5DB]"}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${n.value ? "left-6" : "left-1"}`} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-5 border-t border-[#F0EDF9]">
              <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Antecedência para alertas de prazo</label>
              <div className="flex gap-2">
                {["1", "2", "3", "5", "7"].map(d => (
                  <button
                    key={d}
                    onClick={() => setAntecedencia(d)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      antecedencia === d
                        ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                        : "border-[#DDD6FE] text-[#6B7280] hover:border-[#7C3AED] hover:text-[#7C3AED]"
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center justify-end gap-4">
            {erro && <p className="text-sm text-red-600">{erro}</p>}
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-[#7C3AED] text-white rounded-lg font-semibold text-sm hover:bg-[#6D28D9] transition-colors flex items-center gap-2"
            >
              {salvo ? "✅ Salvo!" : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>

      {/* Change password modal */}
      {senhaModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-lg text-[#1E1B2E] mb-4">Alterar senha</h3>
            <form onSubmit={trocarSenha} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Senha atual</label>
                <input type="password" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-[#DDD6FE] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]" required/>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Nova senha</label>
                <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} placeholder="Mínimo 8 caracteres" className="w-full px-4 py-2.5 rounded-lg border border-[#DDD6FE] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]" required minLength={8}/>
              </div>
              {erroSenha && <p className="text-sm text-red-600">{erroSenha}</p>}
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2.5 bg-[#7C3AED] text-white rounded-lg text-sm font-semibold hover:bg-[#6D28D9]">Salvar</button>
                <button type="button" onClick={() => setSenhaModal(false)} className="flex-1 py-2.5 border border-[#DDD6FE] text-[#6B7280] rounded-lg text-sm hover:bg-[#F5F3FF]">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
