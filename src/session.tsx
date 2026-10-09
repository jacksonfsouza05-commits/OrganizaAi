import { createContext, useContext } from "react";
import type { Estudante } from "./data";

interface Sessao {
  estudante: Estudante;
  setEstudante: (e: Estudante) => void;
  sair: () => void;
}

export const SessaoContext = createContext<Sessao | null>(null);

export function useSessao() {
  const ctx = useContext(SessaoContext);
  if (!ctx) throw new Error("useSessao fora do provider");
  return ctx;
}
