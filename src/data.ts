export type Page =
  | "login"
  | "dashboard"
  | "atividades"
  | "adicionar-atividade"
  | "materias"
  | "resumo-materia"
  | "calendario"
  | "configuracoes";

export type Status = "pendente" | "concluida" | "prazo-proximo";
export type Prioridade = "alta" | "media" | "baixa";

export interface Atividade {
  id: number;
  nome: string;
  materiaId: number;
  materia: string;
  materiaCor: string;
  descricao: string;
  prazo: string;
  prioridade: Prioridade;
  status: Status;
}

export interface Materia {
  id: number;
  nome: string;
  cor: string;
  atividades: number;
  concluidas: number;
  conteudos: number;
  estudados: number;
}

export interface Conteudo {
  id: number;
  titulo: string;
  resumo: string;
  topicos: string[];
  explicacaoSimples: string | null;
  estudado: boolean;
}

export interface Estudante {
  id: number;
  nome: string;
  email: string;
  notifPrazo: boolean;
  notifDiario: boolean;
  notifSemanal: boolean;
  antecedencia: number;
  senhaAlteradaEm: string;
}

export interface Notificacao {
  id: number;
  texto: string;
  urgente: boolean;
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export function daysUntil(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const agora = new Date();
  const hoje = Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate());
  return Math.round((Date.UTC(y, m - 1, d) - hoje) / 86400000);
}

export const statusLabel: Record<Status, string> = {
  pendente: "Pendente",
  concluida: "Concluída",
  "prazo-proximo": "Prazo próximo",
};

export const prioridadeLabel: Record<Prioridade, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};
