import { useCallback, useEffect, useState } from "react";
import type { Page, Atividade, Materia, Estudante } from "./data";
import { api, getToken, limparToken, salvarToken, type DadosAtividade } from "./api";
import { SessaoContext } from "./session";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Atividades from "./pages/Atividades";
import AdicionarAtividade from "./pages/AdicionarAtividade";
import Materias from "./pages/Materias";
import ResumoMateria from "./pages/ResumoMateria";
import Calendario from "./pages/Calendario";
import Configuracoes from "./pages/Configuracoes";

export default function App() {
  const [estudante, setEstudante] = useState<Estudante | null>(null);
  const [iniciando, setIniciando] = useState(!!getToken());
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [materiaAtiva, setMateriaAtiva] = useState<Materia | null>(null);
  const [editandoAtividade, setEditandoAtividade] = useState<Atividade | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const falhou = (e: unknown) => {
    setAviso(e instanceof Error ? e.message : "Algo deu errado");
    setTimeout(() => setAviso(null), 4000);
  };

  const carregar = useCallback(async () => {
    const [a, m] = await Promise.all([api.atividades(), api.materias()]);
    setAtividades(a);
    setMaterias(m);
  }, []);

  const sair = useCallback(() => {
    limparToken();
    setEstudante(null);
    setAtividades([]);
    setMaterias([]);
    setMateriaAtiva(null);
    setCurrentPage("dashboard");
  }, []);

  useEffect(() => {
    if (!getToken()) return;
    api.eu()
      .then(async (e) => {
        setEstudante(e);
        await carregar();
      })
      .catch(() => limparToken())
      .finally(() => setIniciando(false));
  }, [carregar]);

  const aoEntrar = async (token: string, e: Estudante) => {
    salvarToken(token);
    setEstudante(e);
    await carregar();
  };

  if (iniciando) return <div className="min-h-screen flex items-center justify-center text-[#6B7280] text-sm">Carregando...</div>;
  if (!estudante) return <Login onEntrar={aoEntrar} />;

  const handleConcluir = async (id: number) => {
    try {
      await api.concluirAtividade(id);
      await carregar();
    } catch (e) { falhou(e); }
  };

  const handleExcluir = async (id: number) => {
    try {
      await api.excluirAtividade(id);
      await carregar();
    } catch (e) { falhou(e); }
  };

  const handleSalvarAtividade = async (dados: DadosAtividade, id?: number) => {
    try {
      if (id) await api.editarAtividade(id, dados);
      else await api.criarAtividade(dados);
      await carregar();
      return true;
    } catch (e) {
      falhou(e);
      return false;
    }
  };

  const handleAdicionarMateria = async (nome: string, cor: string) => {
    try {
      await api.criarMateria(nome, cor);
      await carregar();
      return true;
    } catch (e) {
      falhou(e);
      return false;
    }
  };

  const handleExcluirMateria = async (id: number) => {
    try {
      await api.excluirMateria(id);
      await carregar();
    } catch (e) { falhou(e); }
  };

  const navigate = (page: Page) => {
    setCurrentPage(page);
    if (page !== "adicionar-atividade") setEditandoAtividade(null);
    if (page === "materias" || page === "dashboard") carregar().catch(falhou);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            atividades={atividades}
            materias={materias}
            onNavigate={navigate}
            onConcluir={handleConcluir}
          />
        );
      case "atividades":
        return (
          <Atividades
            atividades={atividades}
            onNavigate={navigate}
            onConcluir={handleConcluir}
            onExcluir={handleExcluir}
            onEditar={(a) => { setEditandoAtividade(a); navigate("adicionar-atividade"); }}
          />
        );
      case "adicionar-atividade":
        return (
          <AdicionarAtividade
            materias={materias}
            onSalvar={handleSalvarAtividade}
            onNavigate={navigate}
            editando={editandoAtividade}
          />
        );
      case "materias":
        return (
          <Materias
            materias={materias}
            onNavigate={navigate}
            onSelectMateria={setMateriaAtiva}
            onAdicionarMateria={handleAdicionarMateria}
            onExcluirMateria={handleExcluirMateria}
          />
        );
      case "resumo-materia":
        return <ResumoMateria materia={materiaAtiva} onNavigate={navigate} onMudou={() => carregar().catch(falhou)} />;
      case "calendario":
        return <Calendario atividades={atividades} />;
      case "configuracoes":
        return <Configuracoes />;
      default:
        return null;
    }
  };

  return (
    <SessaoContext.Provider value={{ estudante, setEstudante, sair }}>
      <div className="flex min-h-screen bg-[#F5F3FF]">
        <Sidebar currentPage={currentPage} onNavigate={navigate} />
        <main className="flex-1 ml-60 flex flex-col min-h-screen">
          {renderPage()}
        </main>
        {aviso && (
          <div className="fixed bottom-6 right-6 z-50 bg-red-600 text-white text-sm px-4 py-3 rounded-lg shadow-lg">
            {aviso}
          </div>
        )}
      </div>
    </SessaoContext.Provider>
  );
}
