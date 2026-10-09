import { useEffect, useState } from "react";
import { api } from "../api";
import { useSessao } from "../session";
import type { Notificacao } from "../data";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onAddAtividade?: () => void;
}

export default function Header({ title, subtitle, onAddAtividade }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);

  const { estudante } = useSessao();
  const [notifs, setNotifs] = useState<Notificacao[]>([]);

  useEffect(() => {
    api.notificacoes().then(setNotifs).catch(() => setNotifs([]));
  }, []);

  return (
    <header className="h-16 bg-white border-b border-[#DDD6FE] flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h1 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-xl font-bold text-[#1E1B2E]">{title}</h1>
        {subtitle && <p className="text-xs text-[#6B7280]">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {onAddAtividade && (
          <button
            onClick={onAddAtividade}
            className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#6D28D9] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8 3v10M3 8h10"/>
            </svg>
            Nova atividade
          </button>
        )}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#EDE9FE] text-[#6B7280] hover:text-[#7C3AED] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2a6 6 0 00-6 6c0 3.5-1.5 5-1.5 5h15S16 11.5 16 8a6 6 0 00-6-6z"/>
              <path d="M11.73 17a2 2 0 01-3.46 0"/>
            </svg>
            {notifs.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-lg border border-[#DDD6FE] overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[#DDD6FE] flex items-center justify-between">
                <span style={{ fontFamily: "'Outfit', sans-serif" }} className="font-semibold text-sm text-[#1E1B2E]">Notificações</span>
                <span className="text-xs bg-[#7C3AED] text-white rounded-full px-2 py-0.5">{notifs.length}</span>
              </div>
              <div className="divide-y divide-[#F0EDF9] max-h-64 overflow-y-auto">
                {notifs.length === 0 && <p className="px-4 py-6 text-xs text-[#6B7280] text-center">Nada pra avisar por enquanto 🎉</p>}
                {notifs.map(n => (
                  <div key={n.id} className="px-4 py-3 flex gap-3 hover:bg-[#F5F3FF]">
                    <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${n.urgente ? "bg-red-400" : "bg-amber-400"}`}></div>
                    <p className="text-xs text-[#1E1B2E]">{n.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center text-white text-sm font-semibold">
          {estudante.nome.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
