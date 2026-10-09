import type { Atividade, Materia, Conteudo, Estudante, Notificacao, Prioridade } from "./data";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3333/api";
const CHAVE = "avisai_token";

export const getToken = () => localStorage.getItem(CHAVE);
export const salvarToken = (t: string) => localStorage.setItem(CHAVE, t);
export const limparToken = () => localStorage.removeItem(CHAVE);

export class ApiError extends Error {
  status: number;
  constructor(msg: string, status: number) {
    super(msg);
    this.status = status;
  }
}

async function req<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(BASE + caminho, {
      method: metodo,
      headers: {
        ...(corpo !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ApiError("Não consegui falar com o servidor", 0);
  }
  if (res.status === 204) return undefined as T;
  const dados = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(dados.erro || "Algo deu errado", res.status);
  return dados as T;
}

export interface DadosAtividade {
  nome: string;
  materiaId: number;
  descricao: string;
  prazo: string;
  prioridade: Prioridade;
}

export interface DadosConteudo {
  titulo: string;
  resumo: string;
  topicos: string[];
  explicacaoSimples: string;
}

export const api = {
  entrar: (email: string, senha: string) =>
    req<{ token: string; estudante: Estudante }>("POST", "/auth/entrar", { email, senha }),
  registrar: (nome: string, email: string, senha: string) =>
    req<{ token: string; estudante: Estudante }>("POST", "/auth/registrar", { nome, email, senha }),
  eu: () => req<Estudante>("GET", "/auth/eu"),
  salvarPerfil: (d: Pick<Estudante, "nome" | "notifPrazo" | "notifDiario" | "notifSemanal" | "antecedencia">) =>
    req<Estudante>("PUT", "/auth/eu", d),
  trocarSenha: (senhaAtual: string, novaSenha: string) =>
    req<{ ok: boolean }>("PUT", "/auth/senha", { senhaAtual, novaSenha }),

  atividades: () => req<Atividade[]>("GET", "/atividades"),
  criarAtividade: (d: DadosAtividade) => req<Atividade>("POST", "/atividades", d),
  editarAtividade: (id: number, d: DadosAtividade) => req<Atividade>("PUT", `/atividades/${id}`, d),
  concluirAtividade: (id: number) => req<Atividade>("PATCH", `/atividades/${id}/concluir`, {}),
  excluirAtividade: (id: number) => req<void>("DELETE", `/atividades/${id}`),

  materias: () => req<Materia[]>("GET", "/materias"),
  criarMateria: (nome: string, cor: string) => req<Materia>("POST", "/materias", { nome, cor }),
  excluirMateria: (id: number) => req<void>("DELETE", `/materias/${id}`),

  conteudos: (materiaId: number) => req<Conteudo[]>("GET", `/materias/${materiaId}/conteudos`),
  criarConteudo: (materiaId: number, d: DadosConteudo) =>
    req<Conteudo>("POST", `/materias/${materiaId}/conteudos`, d),
  marcarEstudado: (id: number, estudado: boolean) =>
    req<{ id: number; estudado: boolean }>("PATCH", `/conteudos/${id}/estudado`, { estudado }),

  notificacoes: () => req<Notificacao[]>("GET", "/notificacoes"),
};
